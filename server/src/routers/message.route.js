import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, deleteMessage, clearHistory, editMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/clear/:id", protectRoute, clearHistory);
router.delete("/:id", protectRoute, deleteMessage);
router.put("/:id", protectRoute, editMessage);

export default router;
