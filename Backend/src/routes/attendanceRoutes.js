import express from "express";

const AttendanceRouter = express.Router();

AttendanceRouter.post("/mark-attendance");
AttendanceRouter.put("/update-attendance");
AttendanceRouter.delete("/delete-attendance");
AttendanceRouter.get("/all-attendance");
AttendanceRouter.get("staff-attendance");
AttendanceRouter.get("/my-attendance");
AttendanceRouter.get("admin-attendance");
AttendanceRouter.get("monthly-summary");

export default AttendanceRouter;