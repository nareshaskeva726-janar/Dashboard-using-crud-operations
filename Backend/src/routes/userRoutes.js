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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resetPassword", resetPassword);



// Protected Routes
router.post("/addUser",userAuth, addUser);
router.get("/users",userAuth, getUsers);
router.get("/user/:id",userAuth,  getUser);
router.put("/updateUser/:id",userAuth,  updateUser);
router.delete("/deleteUser/:id",userAuth, deleteUser);
router.get("/me", userAuth, getMe);

export default router;