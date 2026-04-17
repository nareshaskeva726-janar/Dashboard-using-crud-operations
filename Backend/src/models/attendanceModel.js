import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date, 
      required: true,
    },

    department: {
      type: String,
      enum: ["ESE", "EEE", "CSE", "MECH", "CIVIL"],
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent",],
      default: "absent",
    },

    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


attendanceSchema.index(
  { studentId: 1, date: 1, subject: 1 },
  { unique: true }
);

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;