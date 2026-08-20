import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routers/auth.route.js";
import messageRoutes from "./src/routers/message.route.js";
import userRoutes from "./src/routers/user.route.js";

import { app, server } from "./src/socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("RWave API is running...");
});

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});