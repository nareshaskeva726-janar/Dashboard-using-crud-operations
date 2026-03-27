import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 },
    contact: { type: Number, required: true },
    forgotPassword: { type: Boolean, default: false },
    resetpassword: { type: String },
    role: { type: String, enum: ["staff", "student"], required: true },


    department: {
      type: String,
      enum: ["Java", "Python", "C", "C++", "DataScience"],
      required: function () {
        // Department is required for staff only
        return this.role === "staff";
      },
    },


    subjects: {
      type: [{ type: String, enum: ["Java", "Python", "C", "C++", "DataScience"] }],
      default: function () {
        
        // Students get all subjects automatically
        return this.role === "student" ? ["Java", "Python", "C", "C++", "DataScience"] : [];
      },
    },
  },


  
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema);

export default User;