import express from "express";
import { announceProject, submitProject, pendingStudents, hodReminder, superadminWarning, getStaffProjects, getMyProjects, staffReminder, getallprojects, getAdminProjects} from "../controllers/assignmentController.js";
import { upload } from "../lib/cloudinary.js";
import userAuth from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
const Projectrouter = express.Router();

Projectrouter.post("/announce", userAuth, checkRole("staff"), announceProject);

Projectrouter.get("/pending-students", userAuth, checkRole("staff", "admin", "superadmin"), pendingStudents);

Projectrouter.post("/staff-reminder", userAuth, checkRole("staff"), staffReminder);

Projectrouter.get("/staff-projects", userAuth, checkRole("staff"), getStaffProjects);

Projectrouter.post("/submit", userAuth, checkRole("student"), upload.single("projectFile"), submitProject);

Projectrouter.get("/my-projects", userAuth, checkRole("student"), getMyProjects);

Projectrouter.get("/get-admin-projects", userAuth, checkRole("admin"), getAdminProjects);

Projectrouter.post("/hod-reminder", userAuth, checkRole("admin"), hodReminder);

Projectrouter.post("/superadmin-warning", userAuth, checkRole("superadmin"), superadminWarning);

Projectrouter.get("/all-projects-superadmin", userAuth, checkRole('superadmin', "admin", 'staff' ), getallprojects);

export default Projectrouter;