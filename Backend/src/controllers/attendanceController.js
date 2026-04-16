import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import { getCurrentPeriod } from "../lib/getCurrentPeriod.js";

export const markAttendance = async (req, res) => {
  try {
    const staff = req.user;

    /* ================= ROLE CHECK ================= */
    if (!staff || staff.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff allowed",
      });
    }

    const { subject, date, students } = req.body;
    console.log("BODY", req.body);

    /* ================= VALIDATION ================= */
    if (!subject || !date) {
      return res.status(400).json({
        success: false,
        message: "subject and date are required",
      });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students required",
      });
    }

    console.log(students, 'students')

    /* ================= SUBJECT AUTH ================= */
    if (!staff.subjects?.includes(subject)) {
      return res.status(403).json({
        success: false,
        message: "You cannot mark this subject",
      });
    }

    /* ================= CURRENT PERIOD ================= */
    const period = getCurrentPeriod();
    
    console.log(period, "period")

    if (!period) {
      return res.status(400).json({
        success: false,
        message: "No active period",
      });
    }

    /* ================= NORMALIZE DATE ================= */
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    /* ================= BULK UPSERT ================= */
    const operations = students
      .filter((s) => s.studentId)
      .map((s) => ({
        updateOne: {
          filter: {
            studentId: new mongoose.Types.ObjectId(s.studentId),
            subject,
            period,
            date: attendanceDate,
          },
          update: {
            $set: {
              status: s.status || "Absent",
              markedBy: staff._id,
              department: staff.department,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      console.log(operations, "operations")

    if (!operations.length) {
      return res.status(400).json({
        success: false,
        message: "No valid student records found",
      });
    }

    await Attendance.bulkWrite(operations);

    /* ================= SUCCESS ================= */
    return res.json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        subject,
        period,
        date: attendanceDate,
        total: operations.length,
      },
    });
  } catch (err) {
    console.error("Mark Attendance Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};





//DELETE ATTENDANCE
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance)
      return res.status(404).json({
        message: "Attendance not found",
      });

    const user = req.user;

    let allowed = false;

    if (user.role === "superadmin") allowed = true;

    else if (user.role === "admin")
      allowed = attendance.department === user.department;

    else if (user.role === "staff")
      allowed =
        attendance.markedBy?.toString() === user._id.toString();

    if (!allowed)
      return res.status(403).json({
        message: "Not authorized",
      });

    await attendance.deleteOne();

    res.json({
      success: true,
      message: "Attendance deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["present", "absent"].includes(status))
      return res.status(400).json({
        message: "Invalid status",
      });

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance)
      return res.status(404).json({
        message: "Attendance not found",
      });

    const user = req.user;

    let allowed = false;

    if (user.role === "superadmin") allowed = true;

    else if (user.role === "admin")
      allowed = attendance.department === user.department;

    else if (user.role === "staff")
      allowed =
        attendance.markedBy?.toString() === user._id.toString();

    if (!allowed)
      return res.status(403).json({
        message: "Not authorized",
      });

    attendance.status = status;
    await attendance.save();

    res.json({
      success: true,
      message: "Attendance updated",
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET ALL ATTENDANCE
export const getAllAttendance = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};

    if (user.role === "staff") {
      filter = {
        department: user.department,
        markedBy: user._id,
      };

      if (user.subjects?.length)
        filter.subject = { $in: user.subjects };
    }

    else if (user.role === "admin") {
      filter.department = user.department;
    }

    // superadmin → no filter

    const data = await Attendance.find(filter)
      .populate("studentId", "name department email")
      .populate("markedBy", "name department")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//MY ATTENDANCE
export const getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({
        message: "Students only",
      });

    const filter = {
      studentId: req.user._id,
    };

    if (req.query.subject)
      filter.subject = req.query.subject;

    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const data = await Attendance.find(filter)
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//MONTHLY SUMMARY
export const getMonthlySummary = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year)
      return res.status(400).json({
        message: "Month & year required",
      });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    let match = {
      date: { $gte: startDate, $lte: endDate },
    };

    const user = req.user;

    if (user.role === "student")
      match.studentId = user._id;

    else if (user.role === "admin")
      match.department = user.department;

    else if (user.role === "staff")
      match.markedBy = user._id;

    const summary = await Attendance.aggregate([
      { $match: match },

      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [
                { $eq: ["$status", "present"] },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      {
        $project: {
          studentName: "$student.name",
          department: "$student.department",
          email: "$student.email",
          total: 1,
          present: 1,
          absent: { $subtract: ["$total", "$present"] },
          percentage: {
            $multiply: [
              { $divide: ["$present", "$total"] },
              100,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};