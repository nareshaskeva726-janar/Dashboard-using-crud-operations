// controllers/notificationController.js
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";



// ---------------- SEND NOTIFICATIONS ----------------
export const sendNotifications = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { message, receiverIds, department, type } = req.body;

    if (!receiverIds?.length)
      return res.status(400).json({ success: false, message: "No receivers selected" });

    const io = req.app.get("io"); // socket.io instance

    // fetch users to get roles
    const users = await User.find({ _id: { $in: receiverIds } })
      .select("_id role")
      .lean();

    const userMap = {};
    users.forEach(u => (userMap[u._id.toString()] = u.role));

    const notifications = [];

    for (const receiverId of receiverIds) {
      const receiverStr = typeof receiverId === "object" ? receiverId._id || receiverId.userId : receiverId;

      // Prevent duplicate notifications
      const existing = await Notification.findOne({
        sender: senderId,
        receiver: receiverStr,
        message,
        type,
        isRead: false,
      });
      if (existing) continue;

      // Create notification
      const notif = await Notification.create({
        sender: senderId,
        receiver: receiverStr,
        senderRole: req.user.role,
        receiverRole: userMap[receiverStr],
        department: department || "",
        type: type || "general",
        message,
        isRead: false,
      });

      notifications.push(notif);

      // Emit socket events
      if (io) {
        io.to(receiverStr.toString()).emit("newNotification", notif);

        const unreadCount = await Notification.countDocuments({
          receiver: receiverStr,
          isRead: false,
        });

        io.to(receiverStr.toString()).emit("notificationCount", unreadCount);
      }
    }

    res.status(201).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("sendNotifications Error:", err);
    res.status(500).json({ success: false, message: "Failed to send notifications" });
  }
};

// ---------------- GET USER NOTIFICATIONS ----------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "name role") // sender info
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("getNotifications Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// ---------------- MARK ALL AS READ ----------------
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllRead Error:", err);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
};

// ---------------- MARK SINGLE NOTIFICATION AS READ ----------------
export const markSingleRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, receiver: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, notification });
  } catch (err) {
    console.error("markSingleRead Error:", err);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};