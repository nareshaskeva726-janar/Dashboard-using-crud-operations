import express from "express";
import {
  markAttendance,
  getMyAttendance,
  getAttendanceByDateSubject,
  updateAttendance,
  deleteAttendance,
  checkAttendance,
  getMonthlySummary,
} from "../controllers/attendanceController.js";

import userAuth from "../middleware/authMiddleware.js";

const attendanceRouter = express.Router();

//  POST
attendanceRouter.post("/mark", userAuth, markAttendance);


attendanceRouter.get("/my", userAuth, getMyAttendance);
attendanceRouter.get("/check", userAuth, checkAttendance);
attendanceRouter.get("/monthly-summary", userAuth, getMonthlySummary);


attendanceRouter.get("/", userAuth, getAttendanceByDateSubject);

// UPDATE
attendanceRouter.put("/:id", userAuth, updateAttendance);

// DELETE
attendanceRouter.delete("/", userAuth, deleteAttendance);

export default attendanceRouter;