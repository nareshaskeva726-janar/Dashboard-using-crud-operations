import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["staff", "student"],
      required: true,
    },

    receiverRole: {
      type: String,
      enum: ["staff", "student"],
      required: true,
    },

    department: {
      type: String,
      enum: ["Java", "Python", "C", "C++", "DataScience"],
    },

    // ✅ FIXED TYPE FIELD
    type: {
      type: String,
      enum: ["general", "submission", "reminder", "approved", "rejected"],
      default: "general",
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Projects",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notifications", NotificationSchema);

export default Notification;