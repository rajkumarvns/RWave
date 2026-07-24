import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // When a user connects, they send their userId in the query
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast to everyone the current list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing status events
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-status", { senderId: userId });
    }
  });

  socket.on("stop-typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop-typing-status", { senderId: userId });
    }
  });

  // Read receipts events
  socket.on("message-seen", ({ messageId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-status-update", {
        messageId,
        status: "seen",
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    // Update everyone with the new online list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
