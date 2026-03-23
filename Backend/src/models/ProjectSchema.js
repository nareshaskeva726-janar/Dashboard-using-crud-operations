import mongoose from "mongoose";

const subjectsList = ["Java", "Python", "C", "C++", "DataScience"];

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    subject: {
      type: String,
      enum: subjectsList,
      required: true,
    },

    projectName: {
      type: String,
      required: true,
    },

    projectFile: {
      type: String, // ✅ file URL (Cloudinary / local path)
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


// ✅ prevent duplicate subject submission
projectSchema.index({ student: 1, subject: 1 }, { unique: true });

const Project = mongoose.model("Projects", projectSchema);

export default Project;