import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const seedSuperadmin = async (req, res) => {
  try {
    const { seedKey } = req.body;

    if (seedKey !== process.env.SEED_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized seeding attempt",
      });
    }

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      return res.status(400).json({ success: false, message: "Superadmin already exists" });
    }

    const hashedPassword = await bcrypt.hash("superadmin@123", 10);

    const superadmin = new User({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password: hashedPassword, // already hashed
      contact: 1234567890,
      role: "superadmin",
    });

    await superadmin.save();

    res.status(201).json({ success: true, message: "Superadmin created successfully", user: superadmin });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};