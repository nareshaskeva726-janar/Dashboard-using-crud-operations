import express from "express";
import {
  updateUser,
  deleteUser,
  loginUser,
  resetPassword,
  // registerUser,
  getMe,
  createUser,
  getAllUsers,
  bulkwritetheusers,
} from "../controllers/userControllers.js";
import userAuth from "../middleware/authMiddleware.js";
import {checkRole} from "../middleware/checkRole.js"


const Userrouter = express.Router();

Userrouter.post("/login", loginUser);

Userrouter.post("/resetPassword", resetPassword);

Userrouter.post("/addUser",userAuth, createUser);

Userrouter.get("/users",userAuth, getAllUsers);

Userrouter.put("/updateUser/:id",userAuth, updateUser);

Userrouter.delete("/deleteUser/:id",userAuth, deleteUser);

Userrouter.get("/me",userAuth,  getMe);

Userrouter.post("/bulk-write", userAuth,  bulkwritetheusers);

export default Userrouter;