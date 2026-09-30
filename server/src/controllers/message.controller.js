import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Mark all unread messages from userToChatId to me as seen
    const updated = await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    if (updated.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(userToChatId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages-seen", {
          chatWith: myId.toString(),
        });
      }
    }

    // Fetch messages where I am sender and they are receiver, OR they are sender and I am receiver
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, isGhost } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isGhost: isGhost || false,
      status: receiverSocketId ? "delivered" : "sent",
    });

    await newMessage.save();

    // Update or create conversation logic for the sidebar
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: newMessage._id,
      });
    } else {
      conversation.lastMessage = newMessage._id;
      await conversation.save();
    }

    // SOCKET.IO REAL-TIME FUNCTIONALITY
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() sends the event to that specific connected client
      io.to(receiverSocketId).emit("receive-message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    // Emit real-time event to receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-deleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({ message: "History cleared successfully" });
  } catch (error) {
    console.error("Error in clearHistory controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== myId.toString()) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }

    // Check if within 1 hour
    const age = Date.now() - new Date(message.createdAt).getTime();
    if (age > 3600000) {
      return res.status(400).json({ error: "Messages can only be edited within 1 hour" });
    }

    message.text = text;
    // You could also set an isEdited flag here if added to schema, but text is fine.
    await message.save();

    // Emit real-time event to receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-edited", { messageId: message._id, text });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
