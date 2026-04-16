import express from "express";

import { sendNotifications, getNotifications, markAllRead, markSingleRead } from "../controllers/notificationController.js";

import useAuth from "../middleware/authMiddleware.js";

const NotificationRouter = express.Router();

// SEND notification
NotificationRouter.post("/send", sendNotifications);

// GET notifications
NotificationRouter.get("/", useAuth, getNotifications);

// MARK all read
NotificationRouter.put("/mark-all-read", useAuth, markAllRead);

// MARK single read
NotificationRouter.put("/mark-read/:id", useAuth, markSingleRead);

export default NotificationRouter;


