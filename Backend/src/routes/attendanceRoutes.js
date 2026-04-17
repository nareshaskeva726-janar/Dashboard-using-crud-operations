import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { adminAttendance, adminMonthlySummary, allAttendance, deleteAttendance, markAttendance, monthlysummary, myAttendance, staffAttendance, staffMonthlySummary, StudentMonthlySummary, updateAttendance } from "../controllers/attendanceController.js";

const AttendanceRouter = express.Router();

//crud funcationality
AttendanceRouter.post("/mark-attendance", userAuth, checkRole("staff"), markAttendance);
AttendanceRouter.put("/update-attendance/:attendanceId", userAuth, checkRole("staff"), updateAttendance);
AttendanceRouter.delete("/delete-attendance/:attendanceId", userAuth, checkRole("staff"), deleteAttendance);

//get all attendance based on roles
AttendanceRouter.get("/all-attendance", userAuth, checkRole("superadmin"), allAttendance);
AttendanceRouter.get("/staff-attendance", userAuth, checkRole("staff"), staffAttendance);
AttendanceRouter.get("/my-attendance", userAuth, checkRole("student"), myAttendance);
AttendanceRouter.get("/admin-attendance", userAuth, checkRole("admin"), adminAttendance);

//monthly summary end points
AttendanceRouter.get("/monthly-summary", userAuth, checkRole("superadmin", "staff", "student", "admin"), monthlysummary);
AttendanceRouter.get("/staff-summary", userAuth, checkRole("staff"), staffMonthlySummary);
AttendanceRouter.get("/admin-summary", userAuth, checkRole("admin"), adminMonthlySummary);
AttendanceRouter.get("/student-summary", userAuth, checkRole("student"), StudentMonthlySummary);

export default AttendanceRouter;