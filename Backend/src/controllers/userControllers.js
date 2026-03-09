import generateToken from "../lib/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";


//REGISTER
export const registerUser = async (req, res) => {
  try {

    const { name, email, password, confirmpassword, contact, role } = req.body;

    if (!name || !email || !password || !confirmpassword || !contact || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmpassword: hashedPassword,
      contact,
      role
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user
    });

  } catch (error) {

    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


//LOGIN
export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }


    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//ADD USER
export const addUser = async (req, res) => {

  try {

    const { name, email, password, contact, role } = req.body;

    if (!name || !email || !password || !contact || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contact,
      role
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//GET ALL USERS
export const getUsers = async (req, res) => {

  try {

    const users = await User.find().select("-password");

    res.json({
      success: true,
      users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//GET SINGLE USER
export const getUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

//UPDATE
export const updateUser = async (req, res) => {

  try {

    const { name, email, contact, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, contact, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//DELETE
export const deleteUser = async (req, res) => {

  try {

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//RESET PASSWORD
export const resetPassword = async (req, res) => {

  try {

    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


//ME
export const getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};