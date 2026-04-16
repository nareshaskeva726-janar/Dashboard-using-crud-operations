import express from "express";
import {
  markAttendance,
  deleteAttendance,
  updateAttendance,
  getAllAttendance,
  getMyAttendance,
  getMonthlySummary,
} from "../controllers/attendanceController.js";

import userAuth from "../middleware/authMiddleware.js";
import {checkRole} from "../middleware/checkRole.js";

const AttendanceRouter = express.Router();

//mark attendance
AttendanceRouter.post(
  "/mark",
  userAuth,
  checkRole("staff"),
  markAttendance
);


//update attendance
AttendanceRouter.put(
  "/:id",
  userAuth,
  checkRole("staff", "admin", "superadmin"),
  updateAttendance
);

//delete attendance
AttendanceRouter.delete(
  "/:id",
  userAuth,
  checkRole("staff", "admin", "superadmin"),
  deleteAttendance
);


//all attendance
AttendanceRouter.get(
  "/",
  userAuth,
  checkRole("staff", "admin", "superadmin"),
  getAllAttendance
);

//my attendance
AttendanceRouter.get(
  "/my",
  userAuth,
  checkRole("student"),
  getMyAttendance
);

//monthly summary
AttendanceRouter.get(
  "/summary",
  userAuth,
  checkRole("student", "staff", "admin", "superadmin"),
  getMonthlySummary
);

export default AttendanceRouter;