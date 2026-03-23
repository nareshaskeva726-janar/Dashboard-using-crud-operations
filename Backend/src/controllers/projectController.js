import Project from "../models/ProjectSchema.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";


// SUBMIT PROJECT (STUDENT)


export const submitProject = async (req, res) => {
  try {
    const { subject, projectName } = req.body;

    const studentId = req.user._id;

    const projectFile = req.file?.path;

    if (!subject || !projectName || !projectFile) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    //  Prevent duplicate submission
    const existing = await Project.findOne({
      student: studentId,
      subject,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already submitted this subject",
      });
    }



    const project = await Project.create({
      student: studentId,
      subject,
      projectName,
      projectFile,
    });

    const io = req.app.get("io");

    const student = await User.findById(studentId);

    // Notify ONLY staff (one-time)
    const staffMembers = await User.find({
      role: "staff",
      department: subject,
    });

    await Promise.all(
      staffMembers.map(async (staff) => {
        const notification = await Notification.create({
          sender: studentId,
          receiver: staff._id,
          senderRole: "student",
          receiverRole: "staff",
          department: subject,
          type: "submission",
          message: `${student.name} submitted "${project.projectName}" (${subject})`,
          project: project._id,
          isRead: false,
        });

        if (io) {
          io.to(staff._id.toString()).emit("newNotification", notification);
        }
      })
    );

    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      project,
    });
  } catch (error) {
    console.error("submitProject Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// GET PENDING STUDENTS (NO NOTIFICATIONS)

export const pendingProjects = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const subject = req.user.department;

    //  Get all students
    const allStudents = await User.find({
      role: "student",
      subjects: subject,
    }).select("_id name email");

    //  Get submitted students
    const submittedProjects = await Project.find({ subject })
      .select("student")
      .lean();

    const submittedIds = new Set(
      submittedProjects.map((p) => p.student.toString())
    );

    //  Filter pending ONLY
    const pendingStudents = allStudents.filter(
      (student) => !submittedIds.has(student._id.toString())
    );

    res.status(200).json({
      success: true,
      subject,
      count: pendingStudents.length,
      pendingStudents,
    });
  } 
  catch (error) {
    console.error("pendingProjects Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 // SEND REMINDER (ONLY BUTTON CLICK)

export const sendReminder = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { pendingStudentIds, subject } = req.body;

    if (req.user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!pendingStudentIds || pendingStudentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending students",
      });
    }

    const io = req.app.get("io");

    //  Create notifications ONLY when button clicked
    const notifications = await Notification.insertMany(
      pendingStudentIds.map((id) => ({
        sender: staffId,
        receiver: id,
        senderRole: "staff",
        receiverRole: "student",
        department: subject,
        type: "reminder",
        message: `Please submit your ${subject} project`,
        isRead: false,
      }))
    );

    //  Emit realtime
    if (io) {
      pendingStudentIds.forEach((id, i) => {
        io.to(id.toString()).emit("newNotification", notifications[i]);
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (error) {
    console.error("sendReminder Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PROJECTS (STAFF)

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("getAllProjects Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET MY PROJECTS (STUDENT)

export const getMyProjects = async (req, res) => {
  try {
    const studentId = req.user._id;

    const projects = await Project.find({ student: studentId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("getMyProjects Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};