import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    period: {
      type: Number, // 1 - 6
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // staff
    },

    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Present",
        },
      },
    ],
  },
  { timestamps: true }
);

// prevent duplicate attendance for same slot
attendanceSchema.index({ date: 1, subject: 1, period: 1, department: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;