import Attendance from "../models/attendance.js";
import User from "../models/userModel.js";


export const markAttendance = async (req, res) => {
  try {
    const { students } = req.body;
    const staffId = req.user._id || req.user.id;

    const today = new Date();
    const date = today.toLocaleDateString("en-CA"); // ✅ FIXED DATE
    const day = today.getDay();

    if (day === 0 || day === 6) {
      return res.status(400).json({ message: "No attendance on weekends!" });
    }

    const subjectSchedule = {
      1: "Java",
      2: "Python",
      3: "C",
      4: "C++",
      5: "DataScience",
    };

    const todaySubject = subjectSchedule[day];

    const staff = await User.findById(staffId);

    
    if (!staff || staff.role !== "staff") {
      return res.status(403).json({ message: "Only staff allowed" });
    }

    if (staff.department !== todaySubject) {
      return res.status(403).json({ message: "Not your subject today!" });
    }

    const existing = await Attendance.findOne({
      date,
      subject: todaySubject,
      staffId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already submitted!" });
    }

    const attendance = await Attendance.create({
      date,
      subject: todaySubject,
      staffId,
      students,
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const studentId = (req.user._id || req.user.id).toString();

    const records = await Attendance.find().sort({ date: -1 });

    const result = [];

    records.forEach((record) => {
      const studentData = record.students.find(
        (s) => s.studentId.toString() === studentId // ✅ FIXED
      );

      // ✅ ONLY push if record exists for this student
      if (studentData) {
        result.push({
          date: record.date,
          subject: record.subject,
          status: studentData.status,
        });
      }
    });

    res.status(200).json(result); // ✅ CLEAN RESPONSE
  } catch (error) {
    console.error("Get My Attendance Error:", error);
    res.status(500).json({ message: "Error fetching attendance" });
  }
};


export const getAttendanceByDateSubject = async (req, res) => {
  try {
    const { date, subject } = req.query;

    if (!date || !subject) {
      return res.status(400).json({ message: "Date and subject required" });
    }

    const attendance = await Attendance.findOne({ date, subject }).populate(
      "students.studentId",
      "name email"
    );

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { students } = req.body;
    const staffId = req.user._id;

    const attendance = await Attendance.findOne({ _id: id, staffId });

    if (!attendance) {
      return res.status(404).json({ message: "Not found" });
    }

    attendance.students = students;
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { date, subject } = req.query;

    const attendance = await Attendance.findOneAndDelete({
      date,
      subject,
      staffId,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const checkAttendance = async (req, res) => {
  try {
    const staffId = req.user._id;

    const today = new Date();
    const date = today.toLocaleDateString("en-CA"); // ✅ FIXED
    const day = today.getDay();

    const subjectSchedule = {
      1: "Java",
      2: "Python",
      3: "C",
      4: "C++",
      5: "DataScience",
    };

    const todaySubject = subjectSchedule[day];

    const existing = await Attendance.findOne({
      date,
      subject: todaySubject,
      staffId,
    });

    res.json({ submitted: !!existing });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};



export const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const studentId = req.user._id.toString();

    const start = `${year}-${month.padStart(2, "0")}-01`;
    const end = `${year}-${month.padStart(2, "0")}-31`;

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    });

    let totalDays = 0;
    let present = 0;
    let absent = 0;
    let leave = 0;

    records.forEach((record) => {
      const studentData = record.students.find(
        (s) => s.studentId.toString() === studentId
      );

      if (studentData) {
        totalDays++;

        if (studentData.status === "Present") present++;
        else if (studentData.status === "Absent") absent++;
        else if (studentData.status === "Leave") leave++;
      }
    });

    const percentage = totalDays
      ? ((present / totalDays) * 100).toFixed(1)
      : 0;

    res.json({
      totalDays,
      present,
      absent,
      leave,
      percentage,
    });
  } catch (error) {
    console.error("Monthly Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};