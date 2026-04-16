import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    department: { type: String, required: true },
    subject: { type: String, required: true },

    announcedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    projectFile: {type: String},

    deadline: { type: Date, required: true },

    
    submittedAt: Date,

    marks: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["announced", "submitted", "failed"],
      default: "announced",
    },
  },
  { timestamps: true }
);

// ✅ Unique only when student submits
projectSchema.index(
  { student: 1, subject: 1 },
  {
    unique: true,
    partialFilterExpression: {
      student: { $type: "objectId" },
    },
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;