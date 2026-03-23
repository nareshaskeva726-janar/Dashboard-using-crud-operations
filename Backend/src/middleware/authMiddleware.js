import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Please login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // ✅ Fetch user with role & department
    const user = await User.findById(decoded.id).select("role department");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // now req.user.role and req.user.department exist

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};

export default userAuth;