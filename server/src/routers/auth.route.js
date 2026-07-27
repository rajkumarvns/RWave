import express from "express";
import { login, logout, register, checkAuth, deleteAccount, updateProfile, forgotPassword, verifyOtp, resetPassword, blockUser, unblockUser } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/check", protectRoute, checkAuth);
router.put("/profile", protectRoute, updateProfile);
router.delete("/account", protectRoute, deleteAccount);
router.post("/block/:id", protectRoute, blockUser);
router.post("/unblock/:id", protectRoute, unblockUser);

export default router;
