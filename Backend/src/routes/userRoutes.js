import express from "express";
import {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  resetPassword,
  registerUser,
  getMe
} from "../controllers/userControllers.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resetPassword", resetPassword);

// Protected Routes (require authentication)
router.use(userAuth); // All routes below are protected

router.post("/addUser", addUser);
router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);
router.get("/me", getMe);

export default router;