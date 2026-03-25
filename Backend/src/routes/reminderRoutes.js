import express from "express";
import { getCronReminder, markAllRemindersAsRead } from "../controllers/reminderController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/reminders", userAuth, getCronReminder);
router.put("/reminders/mark-all", userAuth, markAllRemindersAsRead);

export default router;