import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },

  password: {
    type: String,
    required: true,
    minlength: 6,
    required: true
  },

  contact: {
    type: Number,
    required: true
  },

  forgotPassword: {
    type: Boolean,
    default: false
  },

  resetpassword: {
    type: String
  },
  role: {
    type: String,
    enum: ["staff", "student"],
    required: true
  },

}, { timestamps: true });

const User = mongoose.model("Users", userSchema);

export default User;