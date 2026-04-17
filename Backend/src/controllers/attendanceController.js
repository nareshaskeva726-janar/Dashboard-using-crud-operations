import Attendance from "../models/attendanceModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { sendNotifications } from "./notificationController.js";

// MARK ATTENDANCE + NOTIFY
export const markAttendance = async (req, res) => {
  try {
    const staffId = req.user._id;
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    const { date, department, subject, students } = req.body;

    // ==========================
    // ROLE + DEPARTMENT CHECK
    // ==========================
    if (userRole === "staff" && department !== userDepartment) {
      return res.status(403).json({
        success: false,
        message: "You can only mark attendance for your own department",
      });
    }

    if (!students || !students.length) {
      return res.status(400).json({
        success: false,
        message: "No students provided",
      });
    }

    const attendanceDate = new Date(date);

    // ==========================
    // 1. SAVE ATTENDANCE
    // ==========================
    const bulkOps = students.map((s) => ({
      updateOne: {
        filter: {
          studentId: new mongoose.Types.ObjectId(s.studentId),
          date: attendanceDate,
          subject,
        },
        update: {
          $set: {
            studentId: s.studentId,
            staffId,
            date: attendanceDate,
            department,
            subject,
            status: s.status,
            markedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    // ==========================
    // 2. NOTIFICATION DATA
    // ==========================
    const studentIds = students.map((s) => s.studentId);

    const presentCount = students.filter((s) => s.status === "present").length;
    const absentCount = students.length - presentCount;

    const message = `Attendance marked for ${subject} - Present: ${presentCount}, Absent: ${absentCount}`;

    // ==========================
    // 3. SEND NOTIFICATION
    // ==========================
    await sendNotifications(
      {
        user: req.user,
        body: {
          message,
          receiverIds: studentIds,
          department,
          type: "attendance",
        },
        app: req.app,
      },
      {
        status: () => ({
          json: () => { },
        }),
      }
    );

    // ==========================
    // 4. SOCKET UPDATE
    // ==========================
    const io = req.app.get("io");

    if (io) {
      io.to(`department-${department}`).emit("attendance-updated", {
        subject,
        date: attendanceDate,
      });
    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });

  } catch (error) {
    console.log("Error in markAttendance controller", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ATTENDANCE (STAFF ONLY)
export const updateAttendance = async (req, res) => {
  try {
    const user = req.user;

    // -------------------------
    // 1. ROLE CHECK
    // -------------------------
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff can update attendance",
      });
    }

    const { attendanceId, status } = req.body;

    if (!attendanceId || !status) {
      return res.status(400).json({
        success: false,
        message: "attendanceId and status are required",
      });
    }

    // -------------------------
    // 2. VALID STATUS CHECK
    // -------------------------
    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // -------------------------
    // 3. FIND ATTENDANCE
    // -------------------------
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // -------------------------
    // 4. DEPARTMENT ACCESS CHECK (IMPORTANT)
    // -------------------------
    if (attendance.department !== user.department) {
      return res.status(403).json({
        success: false,
        message: "You can only update your department attendance",
      });
    }



    // -------------------------
    // 5. UPDATE
    // -------------------------
    attendance.status = status;
    attendance.markedAt = new Date();

    await attendance.save();

    // -------------------------
    // 6. SOCKET UPDATE
    // -------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(attendance.studentId.toString()).emit("attendance-updated", {
        attendanceId,
        status,
        subject: attendance.subject,
        period: attendance.period,
        department: attendance.department,
      });
    }

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.log("Error in updateAttendance controller", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE ATTENDANCE (STAFF ONLY)
export const deleteAttendance = async (req, res) => {
  try {
    const user = req.user;

    // -------------------------
    // 1. ROLE CHECK
    // -------------------------
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff can delete attendance",
      });
    }

    const { attendanceId } = req.params;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "attendanceId is required",
      });
    }

    // -------------------------
    // 2. FIND RECORD
    // -------------------------
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // -------------------------
    // 3. DEPARTMENT CHECK (IMPORTANT)
    // -------------------------
    if (attendance.department !== user.department) {
      return res.status(403).json({
        success: false,
        message: "You can only delete attendance from your department",
      });
    }

    // -------------------------
    // 4. DELETE
    // -------------------------
    await Attendance.findByIdAndDelete(attendanceId);

    // -------------------------
    // 5. SOCKET UPDATE
    // -------------------------
    const io = req.app.get("io");

    if (io) {
      io.to(attendance.studentId.toString()).emit("attendance-deleted", {
        attendanceId,
        subject: attendance.subject,
      });
    }

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });

  } catch (error) {
    console.log("Error in deleteAttendance controller", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const allAttendance = async (req, res) => {
  try {
    // -------------------------
    // 1. QUERY FILTERS
    // -------------------------
    const {
      page = 1,
      limit = 50,
      department,
      studentId,
      staffId,
      date,
    } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (studentId) filter.studentId = studentId;
    if (staffId) filter.staffId = staffId;

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: d,
        $lt: nextDay,
      };
    }

    // -------------------------
    // 2. PAGINATION
    // -------------------------
    const skip = (page - 1) * limit;

    // -------------------------
    // 3. FETCH DATA
    // -------------------------
    const attendance = await Attendance.find(filter)
      .populate("studentId", "name email department")
      .populate("staffId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: attendance,
    });

  } catch (error) {
    console.log("Error in allAttendance controller", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ADMIN (HOD) - DEPARTMENT ATTENDANCE ONLY
export const adminAttendance = async (req, res) => {
  try {
    const user = req.user;
    console.log(req.user, "requser")

    // -------------------------
    // 1. ROLE CHECK
    // -------------------------
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin (HOD) can access this",
      });
    }

    if (!user.department) {
      return res.status(400).json({
        success: false,
        message: "Admin department not found",
      });
    }

    // -------------------------
    // 2. QUERY PARAMS
    // -------------------------
    const {
      page = 1,
      limit = 50,
      studentId,
      staffId,
      date,
    } = req.query;

    const filter = {
      department: user.department, // 🔥 IMPORTANT: restrict by HOD dept
    };

    if (studentId) filter.studentId = studentId;
    if (staffId) filter.staffId = staffId;

    // date filter (single day range)
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: d,
        $lt: nextDay,
      };
    }

    // -------------------------
    // 3. PAGINATION
    // -------------------------
    const skip = (page - 1) * limit;

    // -------------------------
    // 4. FETCH ATTENDANCE
    // -------------------------
    const attendance = await Attendance.find(filter)
      .populate("studentId", "name email department")
      .populate("staffId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      department: user.department,
      data: attendance,
    });
  } catch (error) {
    console.log("Error in adminAttendance controller", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STAFF ATTENDANCE (ONLY THEIR DATA)
export const staffAttendance = async (req, res) => {
  try {
    const user = req.user;

    // -------------------------
    // 1. ROLE CHECK
    // -------------------------
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff can access this API",
      });
    }

    // -------------------------
    // 2. QUERY PARAMS
    // -------------------------
    const {
      page = 1,
      limit = 50,
      subject,
      date,
    } = req.query;

    const filter = {
      staffId: user._id, // 🔥 IMPORTANT: only their records
      department: user.department, // restrict department
    };

    if (subject) filter.subject = subject;


    if (date) {
      const d = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: d,
        $lt: nextDay,
      };
    }

    // -------------------------
    // 3. PAGINATION
    // -------------------------
    const skip = (page - 1) * limit;

    // -------------------------
    // 4. FETCH DATA
    // -------------------------
    const attendance = await Attendance.find(filter)
      .populate("studentId", "name email department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: attendance,
    });
  } catch (error) {
    console.log("Error in staffAttendance controller", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MY ATTENDANCE (STUDENT)
export const myAttendance = async (req, res) => {
  try {
    const user = req.user;

    const {
      page = 1,
      limit = 50,
      subject,
      status,
      fromDate,
      toDate,
    } = req.query;

    const filter = {
      studentId: user._id,
    };

    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const skip = (page - 1) * limit;

    const attendance = await Attendance.find(filter)
      .populate("staffId", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    const summary = await Attendance.aggregate([
      { $match: { studentId: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let present = 0;
    let absent = 0;

    summary.forEach((s) => {
      if (s._id === "present") present = s.count;
      if (s._id === "absent") absent = s.count;
    });

    const totalClasses = present + absent;

    const percentage =
      totalClasses > 0
        ? ((present / totalClasses) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: attendance,
      summary: {
        present,
        absent,
        totalClasses,
        percentage: `${percentage}%`,
      },
    });
  } catch (error) {
    console.log("Error in myAttendance controller", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// MONTHLY SUMMARY (all present absent percenatage calculation - SUPERADMIN)
export const monthlysummary = async (req, res) => {
  try {
    const user = req.user;

    // -------------------------
    // 1. ROLE CHECK
    // -------------------------
    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can access global summary",
      });
    }

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // -------------------------
    // 2. AGGREGATION PIPELINE
    // -------------------------
    const summary = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      // group by student
      {
        $group: {
          _id: {
            studentId: "$studentId",
            department: "$department",
          },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },

      // lookup student details
      {
        $lookup: {
          from: "users",
          localField: "_id.studentId",
          foreignField: "_id",
          as: "student",
        },
      },

      {
        $unwind: "$student",
      },

      // final projection
      {
        $project: {
          studentId: "$_id.studentId",
          department: "$_id.department",
          studentName: "$student.name",
          email: "$student.email",
          present: 1,
          absent: 1,
          total: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },

      // sort best attendance first
      {
        $sort: { percentage: -1 },
      },
    ]);

    // -------------------------
    // 3. GLOBAL STATS
    // -------------------------
    const globalStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPresent: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          totalAbsent: {
            $sum: {
              $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      month,
      year,
      globalStats: globalStats[0] || {
        totalRecords: 0,
        totalPresent: 0,
        totalAbsent: 0,
      },
      data: summary,
    });
  } catch (error) {
    console.log("Error in monthly summary controller", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MONTHLY SUMMARY (department present absent calculation - SUPERADMIN)
export const adminMonthlySummary = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only admin/superadmin can access this",
      });
    }

    const { month, year, department } = req.query;

    if (!month || !year || !department) {
      return res.status(400).json({
        success: false,
        message: "month, year, department are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Attendance.aggregate([
      {
        $match: {
          department,
          date: { $gte: startDate, $lte: endDate },
        },
      },

      {
        $group: {
          _id: "$department",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          department: "$_id",
          present: 1,
          absent: 1,
          total: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        department,
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      },
    });
  } catch (error) {
    console.log("Error in adminMonthlySummary", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// MONTHLY SUMMARY (subject present absent calculation - Staff)
export const staffMonthlySummary = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff can access this",
      });
    }

    const { month, year, subject } = req.query;

    if (!month || !year || !subject) {
      return res.status(400).json({
        success: false,
        message: "month, year, subject are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Attendance.aggregate([
      {
        $match: {
          subject,
          date: { $gte: startDate, $lte: endDate },
        },
      },

      {
        $group: {
          _id: "$subject",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          subject: "$_id",
          present: 1,
          absent: 1,
          total: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        subject,
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      },
    });
  } catch (error) {
    console.log("Error in staffMonthlySummary", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// MONTHLY SUMMARY (Present and absented subject calculation - Student)
export const StudentMonthlySummary = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this",
      });
    }

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Attendance.aggregate([
      {
        $match: {
          studentId: user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },

      {
        $group: {
          _id: "$subject",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          subject: "$_id",
          present: 1,
          absent: 1,
          total: 1,
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$present", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },

      { $sort: { percentage: -1 } },
    ]);

    // overall stats
    const overall = await Attendance.aggregate([
      {
        $match: {
          studentId: user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary,
      globalStats: overall[0] || {
        total: 0,
        present: 0,
        absent: 0,
      },
    });
  } catch (error) {
    console.log("Error in StudentMonthlySummary", error);
    res.status(500).json({ success: false, message: error.message });
  }
};







