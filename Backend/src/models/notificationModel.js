import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderRole: { type: String, enum: ["superadmin", "admin", "staff", "student"] },
    receiverRole: { type: String, enum: ["superadmin", "admin", "staff", "student"] },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, 
    department: { type: String },
    type: {
      type: String,
      enum: [
        "general",
        "announcement",
        "submission",
        "reminder",
        "hod-reminder",
        "warning",
        "attendance"
      ],
      default: "general",
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;