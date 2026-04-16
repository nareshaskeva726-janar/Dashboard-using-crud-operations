import express from "express";
import { sendMessage, getConversation, getChatUsers, getAllMessages } from "../controllers/chatController.js";
import userAuth from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const ChatRouter = express.Router();

ChatRouter.post("/send", userAuth, sendMessage);

ChatRouter.get("/users", userAuth, getChatUsers);

ChatRouter.get("/all-messages", userAuth, checkRole("superadmin", "admin", "staff", "student"), getAllMessages);

ChatRouter.get(
    "/conversation",
    userAuth,
    checkRole("superadmin", "admin", "staff", "student"),
    getConversation
);

export default ChatRouter;