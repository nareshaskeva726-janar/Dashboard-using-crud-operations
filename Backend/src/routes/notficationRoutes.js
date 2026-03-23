import express from "express";
import {
  getNotifications,
  markNotificationsRead,
  markSingleNotificationRead,
  sendNotifications,
  sendReminderByDepartment,
} from "../controllers/notificationController.js";
import userAuth from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

// ✅ Send notification
notificationRouter.post("/send", userAuth, sendNotifications);

// ✅ Get notifications
notificationRouter.get("/", userAuth, getNotifications);

// ✅ Mark single first (IMPORTANT ORDER)
notificationRouter.put("/mark-read/:id", userAuth, markSingleNotificationRead);

// ✅ Mark all
notificationRouter.put("/mark-read", userAuth, markNotificationsRead);

// ✅ Send reminders
notificationRouter.post(
  "/projects/reminders",
  userAuth,
  sendReminderByDepartment
);

export default notificationRouter;