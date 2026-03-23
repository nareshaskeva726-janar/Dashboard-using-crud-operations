import express from "express";
import {
  getAllProjects,
  submitProject,
  pendingProjects,
  getMyProjects,
  sendReminder,
} from "../controllers/projectController.js";

import { upload } from "../config/cloudinary.js";
import userAuth from "../middleware/authMiddleware.js";

const projectRouter = express.Router();

// ✅ Submit a project
projectRouter.post(
  "/submit-project",
  userAuth,
  upload.single("projectFile"),
  submitProject
);

// ✅ Get all submitted projects (staff)
projectRouter.get("/all-projects", userAuth, getAllProjects);

// ✅ Get projects for logged-in student
projectRouter.get("/my-projects", userAuth, getMyProjects);

// ✅ Get pending students and send reminders (staff)
projectRouter.get("/getpendingprojects", userAuth, pendingProjects);

projectRouter.post("/send-reminder", userAuth, sendReminder);

export default projectRouter;