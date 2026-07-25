import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// Load env variables (assuming this is run from the 'server' directory)
dotenv.config();

const dummyUsers = [
  {
    fullName: "John Doe",
    email: "john@example.com",
    password: "password123",
    profilePic: "https://avatar.iran.liara.run/public/boy?username=John",
  },
  {
    fullName: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    profilePic: "https://avatar.iran.liara.run/public/girl?username=Jane",
  },
  {
    fullName: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    profilePic: "https://avatar.iran.liara.run/public/girl?username=Alice",
  },
  {
    fullName: "Bob Builder",
    email: "bob@example.com",
    password: "password123",
    profilePic: "https://avatar.iran.liara.run/public/boy?username=Bob",
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/rwave";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    for (let userData of dummyUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        // Hash the password properly just like our Auth Controller does
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        await User.create({
          ...userData,
          password: hashedPassword,
        });
        console.log(`✅ Created dummy user: ${userData.fullName}`);
      } else {
        console.log(`⏩ Skipped: ${userData.fullName} already exists.`);
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
