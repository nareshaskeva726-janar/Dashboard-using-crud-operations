import Attendance from "../models/attendance.js";
import User from "../models/userModel.js";

export const markAttendance = async (req, res) => {
  try {
    const { students } = req.body;
    const staffId = req.user.id;

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const day = today.getDay(); 

 
    if (day === 0 || day === 6)
      return res.status(400).json({ message: "No attendance on weekends!" });

    const subjectSchedule = {
      1: "Java",
      2: "Python",
      3: "C",
      4: "C++",
      5: "DataScience",
    };
    const todaySubject = subjectSchedule[day];


    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff")
      return res.status(403).json({ message: "Only staff can mark attendance" });

    if (staff.department !== todaySubject)
      return res.status(403).json({ message: "You cannot submit attendance today!" });

  
    const existing = await Attendance.findOne({ date, subject: todaySubject });
    if (existing)
      return res.status(400).json({ message: "Attendance already submitted for today!" });

  
    if (!students || students.length === 0)
      return res.status(400).json({ message: "Students data is required" });

    const studentIds = students.map((s) => s.studentId);
    const validStudents = await User.find({ _id: { $in: studentIds }, role: "student" });
    if (validStudents.length !== students.length)
      return res.status(400).json({ message: "Invalid student data" });

   
    const attendance = new Attendance({
      date,
      subject: todaySubject,
      staffId,
      students,
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully ",
      attendance,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ success: false, message: "Server error while marking attendance" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

 
    const records = await Attendance.find().sort({ date: -1 });

    
    const result = records.map((record) => {
      const studentData = record.students.find(
        (s) => s.studentId.toString() === studentId
      );

      return {
        date: record.date,
        subject: record.subject,
        status: studentData ? studentData.status : "Absent",
      };
    });

    res.status(200).json({ success: true, attendance: result });
  } catch (error) {
    console.error("Get My Attendance Error:", error);
    res.status(500).json({ success: false, message: "Error fetching attendance" });
  }
};

export const getAttendanceByDateSubject = async (req, res) => {
  try {
    const { date, subject } = req.query;
    console.log(req.query);

    if (!date || !subject)
      return res.status(400).json({ message: "Date and subject required" });

    const attendance = await Attendance.findOne({ date, subject }).populate(
      "students.studentId",
      "name email"
    );

    if (!attendance)
      return res.status(404).json({ message: "No attendance found" });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { students } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    attendance.students = students;
    await attendance.save();

    res.status(200).json({ success: true, message: "Attendance updated successfully", attendance });
  } catch (error) {
    console.error("Update Attendance Error:", error);
    res.status(500).json({ success: false, message: "Error updating attendance" });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json({ success: true, message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("Delete Attendance Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};