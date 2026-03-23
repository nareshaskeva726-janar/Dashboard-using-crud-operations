import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getAttendanceByDateSubject,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";

import userAuth from "../middleware/authMiddleware.js";

const attendanceRouter = express.Router();

attendanceRouter.post("/mark", userAuth, markAttendance);

attendanceRouter.get("/my", userAuth, getMyAttendance);

attendanceRouter.get("/", userAuth, getAttendanceByDateSubject);

attendanceRouter.put("/:id", userAuth, updateAttendance);

attendanceRouter.delete("/:id", userAuth, deleteAttendance);

export default attendanceRouter;