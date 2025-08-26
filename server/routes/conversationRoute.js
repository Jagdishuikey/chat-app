// routes/conversationRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createConversation, getUserConversations } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protectRoute, createConversation);   // create group or private chat
router.get("/", protectRoute, getUserConversations); // fetch user’s groups & chats

export default router;
