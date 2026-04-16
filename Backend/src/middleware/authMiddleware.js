import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token; 

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("name role department subjects");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; 

    next();

  } catch (error) {
    
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};

export default userAuth;