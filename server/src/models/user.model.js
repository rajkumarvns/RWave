import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordOtpExpires: {
      type: Date,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    statusMessage: {
      type: String,
      enum: ["Available", "Busy", "Away", "Offline"],
      default: "Available",
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacySettings: {
      showPhoneNumber: {
        type: Boolean,
        default: false,
      },
      showLastSeen: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
