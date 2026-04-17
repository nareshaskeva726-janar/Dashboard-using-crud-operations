import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { adminAttendance, allAttendance, deleteAttendance, markAttendance, monthlysummary, myAttendance, staffAttendance, updateAttendance } from "../controllers/attendanceController.js";

const AttendanceRouter = express.Router();

AttendanceRouter.post("/mark-attendance", userAuth, checkRole("staff"), markAttendance);
AttendanceRouter.put("/update-attendance", userAuth, checkRole("staff"), updateAttendance);
AttendanceRouter.delete("/delete-attendance", userAuth, checkRole("staff"), deleteAttendance);
AttendanceRouter.get("/all-attendance", userAuth, checkRole("superadmin"), allAttendance);
AttendanceRouter.get("/staff-attendance", userAuth, checkRole("staff"), staffAttendance);
AttendanceRouter.get("/my-attendance", userAuth, checkRole("student"), myAttendance);
AttendanceRouter.get("/admin-attendance", userAuth, checkRole("admin"), adminAttendance);
AttendanceRouter.get("/monthly-summary", userAuth, checkRole("superadmin", "staff", "student", "admin"), monthlysummary);

export default AttendanceRouter;