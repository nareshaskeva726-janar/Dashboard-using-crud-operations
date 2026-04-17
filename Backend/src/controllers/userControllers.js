import generateToken from "../lib/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password" });

    // if(password !== confirmpassword){
    //   return res.status(400).json({success: false, message: "passsword not match"});
    // }

    const token = generateToken(user);

    console.log(token, "Token");

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   // secure: process.env.NODE_ENV === "production",
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   path: "/",
    // });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,        // false in localhost
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const { password: _, ...userData } = user._doc;
    res.json({ success: true, message: "Login successful", token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, subjects, contact } = req.body;

    const creatorRole = req.user.role;

    // ROLE RESTRICTIONS
    if (creatorRole === "admin" && ["admin", "superadmin"].includes(role))
      return res.status(403).json({ message: "Admins can only create staff/students" });

    if (creatorRole === "staff" && role !== "student")
      return res.status(403).json({ message: "Staff can only create students" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    if (req.body.contact) {
      req.body.contact = Number(req.body.contact);
    }

    const hashedPassword = await bcrypt.hash(password, 10);



    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      subjects,
      contact
    });

    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updaterRole = req.user.role;

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (updaterRole === "admin" && ["admin", "superadmin"].includes(targetUser.role))
      return res.status(403).json({ message: "Admins cannot update admins or superadmins" });

    if (updaterRole === "staff" && targetUser.role !== "student")
      return res.status(403).json({ message: "Staff can only update students" });

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.body.contact) {
      req.body.contact = Number(req.body.contact);
    }

    Object.assign(targetUser, req.body);
    await targetUser.save();

    res.json({ message: "User updated", user: targetUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleterRole = req.user.role;

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (deleterRole === "admin" && ["admin", "superadmin"].includes(targetUser.role))
      return res.status(403).json({ message: "Admins cannot delete admins or superadmins" });

    if (deleterRole === "staff" && targetUser.role !== "student")
      return res.status(403).json({ message: "Staff can only delete students" });

    await targetUser.deleteOne(); // ✅ Mongoose 6+ fix
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ success: false, message: "Email and new password required" });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};