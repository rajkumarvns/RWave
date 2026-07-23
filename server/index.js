import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routers/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(express.json()); // Parse JSON payloads
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies across origins
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("RWave API is running...");
});

// Initialize Server and Database
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
