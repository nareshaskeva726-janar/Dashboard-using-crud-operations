import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";


export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id.toString(); // safer
    const { receiver, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({ success: false, message: "Receiver and message are required" });
    }

    const receiverId = receiver.toString();
    const conversationId = [senderId, receiverId].sort().join("_");

    const chat = new Chat({
      sender: senderId,
      receiver: receiverId,
      conversationId,
      message: message.trim(),
    });

    await chat.save();

    return res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("sendMessage error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getConversation = async (req, res) => {
  try {
    const loggedUser = req.user;
    let { userA, userB } = req.query;

    // student always becomes participant
    if (loggedUser.role === "student") {
      userA = loggedUser._id;
    }

    // validation
    if (
      !mongoose.Types.ObjectId.isValid(userA) ||
      !mongoose.Types.ObjectId.isValid(userB)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid users" });
    }

    const userAId = new mongoose.Types.ObjectId(userA);
    const userBId = new mongoose.Types.ObjectId(userB);

    //  ONLY SECURITY RULE
    const isParticipant =
      userAId.equals(loggedUser._id) ||
      userBId.equals(loggedUser._id) ||
      loggedUser.role === "superadmin";

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not your conversation",
      });
    }

    // ================= FETCH CHAT =================
    const messages = await Chat.find({
      $or: [
        { sender: userAId, receiver: userBId },
        { sender: userBId, receiver: userAId },
      ],
    })
      .populate("sender", "name role department subjects")
      .populate("receiver", "name role department subjects")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getConversation error:", error);

    res
      .status(500)
      .json({ success: false, message: "Failed to fetch conversation" });
  }
};

export const getChatUsers = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chats = await Chat.find({ $or: [{ sender: userId }, { receiver: userId }] });

    const usersSet = new Set();

    chats.forEach((chat) => {
      if (chat.sender.toString() !== userId) usersSet.add(chat.sender.toString());
      if (chat.receiver.toString() !== userId) usersSet.add(chat.receiver.toString());
    });

    const chatUsers = await User.find({ _id: { $in: [...usersSet] } }).select("name email profilePic department role");

    res.status(200).json({ success: true, users: chatUsers });

  } catch (error) {
    console.error("getChatUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat users" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { _id: userId, role, department, subjects } = req.user;

    let query = {};

    switch (role.toLowerCase()) {
      case "superadmin":
        query = {}; // everything
        break;

      case "admin":
        // Admin sees only staff and students in their department
        const deptUsers = await User.find({
          department,
          role: { $in: ["staff", "student"] },
        }).select("_id");
        const deptUserIds = deptUsers.map((u) => u._id);
        query = {
          $or: [
            { sender: { $in: deptUserIds } },
            { receiver: { $in: deptUserIds } },
          ],
        };
        break;

      case "staff":
        // Staff sees only their subject students
        const subjectStudents = await User.find({
          subjects: { $in: subjects || [] },
          role: "student",
        }).select("_id");
        const studentIds = subjectStudents.map((u) => u._id);
        query = {
          $or: [
            { sender: { $in: studentIds } },
            { receiver: { $in: studentIds } },
          ],
        };
        break;

      case "student":
        query = { $or: [{ sender: userId }, { receiver: userId }] };
        break;

      default:
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Chat.find(query)
      .populate("sender", "name email role department subjects ")
      .populate("receiver", "name email role department subjects ")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("getAllMessages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};


