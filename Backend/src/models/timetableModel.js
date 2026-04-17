import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      enum: ["ESE", "EEE", "CSE", "MECH", "CIVIL"],
      required: true,
    },

    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },

    period: {
      type: Number,
      required: true, // 1 to 6
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
  },
  { timestamps: true }
);

timetableSchema.index(
  { department: 1, day: 1, period: 1 },
  { unique: true }
);

const Timetable =
  mongoose.models.Timetable ||
  mongoose.model("Timetable", timetableSchema);

export default Timetable;