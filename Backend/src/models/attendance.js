import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // you can change to Date later
      required: true,
    },

    subject: {
      type: String,
      enum: ["Java", "Python", "C", "C++", "DataScience"],
      required: true,
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    students: {
      type: [studentAttendanceSchema],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;