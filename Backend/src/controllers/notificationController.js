import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Project from "../models/ProjectSchema.js";

//  SEND GENERAL NOTIFICATION 
export const sendNotifications = async (req, res) => {
  try {
    const senderId = new mongoose.Types.ObjectId(req.user._id);
    const { message, receiverIds, department } = req.body;

    if (!receiverIds?.length) {
      return res.status(400).json({
        success: false,
        message: "No receivers selected",
      });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    const io = req.app.get("io");

    const notifications = [];

    for (const receiverId of receiverIds) {
      const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

      const receiver = await User.findById(receiverObjectId);
      if (!receiver) continue;

      //  PREVENT DUPLICATE
      const existing = await Notification.findOne({
        sender: senderId,
        receiver: receiverObjectId,
        message,
        isRead: false,
      });

      if (existing) continue;

      const notification = await Notification.create({
        sender: senderId,
        receiver: receiverObjectId,
        senderRole: sender.role,
        receiverRole: receiver.role,
        department: department || "",
        type: "general",
        message,
        isRead: false,
      });

      notifications.push(notification);

      // ✅ realtime
      io?.to(receiverObjectId.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("sendNotifications Error:", error);
    res.status(500).json({ success: false });
  }
};

// GET NOTIFICATIONS 
export const getNotifications = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "name role")
      .populate("project", "projectName subject")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("getNotifications Error:", error);
    res.status(500).json({ success: false });
  }
};

// MARK ALL READ 
export const markNotificationsRead = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    await Notification.updateMany(
      { receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("markNotificationsRead Error:", error);
    res.status(500).json({ success: false });
  }
};

// MARK SINGLE READ 
export const markSingleNotificationRead = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        receiver: userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("markSingleNotificationRead Error:", error);
    res.status(500).json({ success: false });
  }
};

// SEND REMINDER 
export const sendReminderByDepartment = async (req, res) => {
  try {
    const staffId = new mongoose.Types.ObjectId(req.user._id);
    const subject = req.user.department;

    if (req.user.role !== "staff") {
      return res.status(403).json({ success: false });
    }

    const io = req.app.get("io");

    //  ALL STUDENTS
    const allStudents = await User.find({
      role: "student",
      subjects: subject,
    }).select("_id name email");

    //  SUBMITTED PROJECTS
    const submittedProjects = await Project.find({ subject })
      .select("student")
      .lean();

    const submittedIds = new Set(
      submittedProjects.map((p) => p.student.toString())
    );

    //  ONLY PENDING STUDENTS
    const pendingStudents = allStudents.filter(
      (s) => !submittedIds.has(s._id.toString())
    );

    const notifications = [];

    for (const student of pendingStudents) {

      const existing = await Notification.findOne({
        receiver: student._id,
        department: subject,
        type: "reminder",
        isRead: false,
      });

      if (existing) continue; 

      const notif = await Notification.create({
        sender: staffId,
        receiver: student._id,
        senderRole: "staff",
        receiverRole: "student",
        department: subject,
        type: "reminder",
        message: `Please submit your ${subject} project`,
        isRead: false,
      });

      notifications.push(notif);

      //  realtime send
      io?.to(student._id.toString()).emit("newNotification", notif);
    }

    res.status(200).json({
      success: true,
      pendingStudents,
      sentCount: notifications.length,
    });
  } catch (error) {
    console.error("sendReminder Error:", error);
    res.status(500).json({ success: false });
  }
};