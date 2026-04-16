import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const announceProject = async (req, res) => {
  try {
    console.log(req.user, "requser")

    if (!req.user || req.user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Only staff can announce projects",
      });
    }

    const { subject, projectName, deadline } = req.body;
    const staffId = req.user._id;

    if (!subject || !projectName || !deadline)
      return res.status(400).json({ message: "All fields required" });

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline))
      return res.status(400).json({ message: "Invalid deadline" });

    /* ---------- Department Mapping ---------- */
    const departmentSubjectsMap = {
      ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
      EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
      CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
      MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
      CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"],
    };

    let department = null;
    for (const [dept, subjects] of Object.entries(departmentSubjectsMap)) {
      if (subjects.includes(subject)) {
        department = dept;
        break;
      }
    }

    if (!department)
      return res.status(400).json({ message: "Invalid subject" });

    /* ---------- Create Announcement ---------- */
    const project = await Project.create({
      projectName,
      department,
      subject,
      deadline: parsedDeadline,
      announcedBy: staffId,
      status: "announced",
    });

    /* ---------- Notify Students ---------- */
    const students = await User.find({
      role: "student",
      subjects: subject,
    }).select("_id");

    const io = req.app.get("io");

    await Promise.all(
      students.map(async (student) => {
        const notif = await Notification.create({
          sender: staffId,
          receiver: student._id,
          senderRole: "staff",
          receiverRole: "student",
          type: "announcement",
          department,
          message: `New project announced: ${projectName} (${subject})`,
          project: project._id,
        });

        io?.to(student._id.toString()).emit("newNotification", notif);
      })
    );

    res.status(201).json({
      success: true,
      project,
      sentCount: students.length,
    });
  } catch (err) {
    console.error("announceProject Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const submitProject = async (req, res) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ message: "Only students allowed" });

    const { projectName, subject } = req.body;
    const studentId = req.user._id;
    const senderName = req.user.name;
    const projectFile = req.file?.path;

    if (!projectFile) return res.status(400).json({ message: "Project file required" });
    if (!projectName || !subject)
      return res.status(400).json({ message: "Project name & subject required" });

    const alreadySubmitted = await Project.findOne({ student: studentId, subject });
    if (alreadySubmitted)
      return res.status(400).json({ message: "Already submitted for this subject" });

    const template = await Project.findOne({ subject, status: "announced" })
      .sort({ createdAt: -1 });

    if (!template)
      return res.status(404).json({ message: "No project announced for this subject" });

    const today = new Date();
    const deadline = new Date(template.deadline);
    const diffDays = Math.ceil((today - deadline) / (1000 * 60 * 60 * 24));

    // MARK CALCULATION
    let marks = 10; // default full marks
    let status = "submitted";

    if (diffDays > 0) {
      if (diffDays <= 5) {
        // Late but within 5 days → reduce marks gradually to 5
        marks = Math.max(10 - diffDays, 5);
        status = "late";
      } else if (diffDays <= 10) {
        // Between 6-10 days → marks between 5-0
        marks = Math.max(5 - (diffDays - 5), 0);
        status = "late";
      } else {
        // After 10 days → 0 marks
        marks = 0;
        status = "late";
      }
    }

    const submission = await Project.create({
      student: studentId,
      department: template.department,
      subject,
      projectName,
      projectFile,
      deadline: template.deadline,
      announcedBy: template.announcedBy,
      submittedAt: today,
      marks,
      status,
    });

    const staffList = await User.find({ role: "staff", subjects: { $in: [subject] } });
    const io = req.app.get("io");

    await Promise.all(
      staffList.map(async (staff) => {
        const notif = await Notification.create({
          sender: studentId,
          receiver: staff._id,
          senderRole: "student",
          receiverRole: staff.role,
          type: "submission",
          department: submission.department,
          message: `${senderName} submitted "${projectName}"`,
          project: submission._id,
        });

        await notif.populate("sender", "name");
        io?.to(staff._id.toString()).emit("newNotification", notif);
      })
    );

    // SEND REMINDER LOGIC
    if (marks === 5) {
      // Admin can send reminder
      const adminUsers = await User.find({ role: "admin" });
      adminUsers.forEach((admin) => {
        io?.to(admin._id.toString()).emit("reminder", {
          message: `Project "${projectName}" submitted late. Marks reduced to 5.`,
          projectId: submission._id,
        });
      });
    } else if (marks === 0) {
      // Superadmin can send reminder
      const superadmins = await User.find({ role: "superadmin" });
      superadmins.forEach((sa) => {
        io?.to(sa._id.toString()).emit("reminder", {
          message: `Project "${projectName}" submitted too late. Marks are 0.`,
          projectId: submission._id,
        });
      });
    }

    res.status(200).json({
      success: true,
      submission,
      marks,
      message: "Project submitted successfully",
    });

  } catch (err) {
    console.error("submitProject Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const pendingStudents = async (req, res) => {
  try {
    if (req.user.role !== "staff")
      return res.status(403).json({ message: "Only staff allowed" });

    const staff = await User.findById(req.user._id);
    const subject = staff.subjects?.[0];

    const students = await User.find({
      role: "student",
      subjects: subject,
    }).lean();

    const submissions = await Project.find({
      subject,
      student: { $ne: null },
    }).select("student");

    const submittedIds = new Set(
      submissions.map((p) => p.student?.toString())
    );

    const pending = students.filter(
      (s) => !submittedIds.has(s._id.toString())
    );

    res.json({ success: true, pendingStudents: pending });
  } catch (err) {
    console.error("pendingStudents Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const staffReminder = async (req, res) => {
  try {
    if (req.user.role !== "staff")
      return res.status(403).json({ message: "Only staff allowed" });

    const { pendingStudentIds, subject } = req.body;
    if (!pendingStudentIds?.length)
      return res.status(400).json({ message: "No students" });

    const io = req.app.get("io");

    const notifications = await Promise.all(
      pendingStudentIds.map(async (id) => {
        const notif = await Notification.create({
          sender: req.user._id,
          receiver: id,
          senderRole: "staff",
          receiverRole: "student",
          type: "reminder",
          message: `Reminder: Submit project for ${subject}`,
        });

        io?.to(id.toString()).emit("newNotification", notif);
        return notif;
      })
    );

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStaffProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      announcedBy: req.user._id,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getAdminProjects = async (req, res) => {
  try {
    const loggedUser = req.user; // from auth middleware

    // safety check
    if (loggedUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const adminProjects = await Project.find({
      department: loggedUser.department,
      submittedAt: { $ne: null }, // only submitted projects
    })
      .populate("student", "name email department")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: adminProjects,
    });
  } catch (error) {
    console.log("Error in getAdminProjects:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      student: req.user._id,
    })
      .populate("announcedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const hodReminder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin allowed" });
    }

    const { studentIds, projectId, message } = req.body;
    const io = req.app.get("io");

    if (!studentIds?.length)
      return res.status(400).json({ message: "No students provided" });

    const notifications = await Promise.all(
      studentIds.map(async (studentId) => {
        const notif = await Notification.create({
          sender: req.user._id,
          receiver: studentId,
          senderRole: "admin",
          receiverRole: "student",
          type: "hod-reminder",
          message:
            message || "HOD Reminder: Submit project immediately (Marks ≤5)",
          project: projectId,
        });

        io?.to(studentId.toString()).emit("newNotification", notif);

        return notif;
      })
    );

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error("hodReminder Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const superadminWarning = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only superadmin allowed" });
    }

    const { studentIds, message } = req.body;
    const io = req.app.get("io");

    if (!studentIds?.length)
      return res.status(400).json({ message: "No students provided" });

    const notifications = await Promise.all(
      studentIds.map(async (studentId) => {
        const notif = await Notification.create({
          sender: req.user._id,
          receiver: studentId,
          senderRole: "superadmin",
          receiverRole: "student",
          type: "warning",
          message:
            message ||
            "FINAL WARNING: Marks reached 0. Immediate submission required!",
        });

        io?.to(studentId.toString()).emit("newNotification", notif);

        return notif;
      })
    );

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error("superadminWarning Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getallprojects = async (req, res) => {
  try {

    const allprojects = await Project.find()
      .populate("student", "name email"); // ⭐ IMPORTANT

    res.status(200).json({
      success: true,
      message: "Fetched projects for superadmin",
      data: allprojects,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};