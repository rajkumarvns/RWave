import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "";
const allowedOrigins = [
  clientUrl,
  clientUrl.startsWith("http") ? clientUrl : `https://${clientUrl}`,
  clientUrl.startsWith("http") ? clientUrl : `http://${clientUrl}`,
  "http://localhost:5173",
  "http://localhost:3000",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Get userId from socket connection
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-status", {
        senderId: userId,
      });
    }
  });

  // Stop typing
  socket.on("stop-typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop-typing-status", {
        senderId: userId,
      });
    }
  });

  // Message seen handlers
  socket.on("mark-messages-seen", async ({ senderId }) => {
    try {
      if (!userId || !senderId) return;
      await Message.updateMany(
        { senderId, receiverId: userId, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
      );
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages-seen", {
          chatWith: userId.toString(),
        });
      }
    } catch (err) {
      console.error("Error in mark-messages-seen socket handler:", err);
    }
  });

  socket.on("message-seen", async ({ messageId, receiverId }) => {
    try {
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, { status: "seen" });
      }
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message-status-update", {
          messageId,
          status: "seen",
        });
      }
    } catch (err) {
      console.error("Error in message-seen socket handler:", err);
    }
  });

  // WebRTC Signaling
  socket.on("call-user", (data) => {
    const receiverSocketId = getReceiverSocketId(data.userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        signal: data.signalData,
        from: data.from,
        callType: data.callType,
      });
    } else {
      socket.emit("call-unavailable");
    }
  });

  socket.on("answer-call", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-answered", data.signal);
    }
  });

  socket.on("ice-candidate", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", data.candidate);
    }
  });

  socket.on("end-call", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };