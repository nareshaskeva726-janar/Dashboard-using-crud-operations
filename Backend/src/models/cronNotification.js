import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    message: { type: String },
    isRead: {type: Boolean, default: false}
    
}, { timestamps: true });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;