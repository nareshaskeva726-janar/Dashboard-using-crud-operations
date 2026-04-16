// userModel.js
import mongoose from "mongoose";

const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
  CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
  MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
  CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"]
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    contact: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "staff", "student"],
      required: true,
    },

    department: {
      type: String,
      enum: Object.keys(departmentSubjectsMap),
      required: function () {
        return this.role !== "superadmin";
      }
    },

    subjects: {
      type: [String],
      default: [],
    },

    forgotPassword: {
      type: Boolean,
      default: false,
    },

    resetpassword: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;