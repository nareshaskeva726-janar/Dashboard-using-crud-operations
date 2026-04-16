import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  date: { type: Date, unique: true },
  title: String,
});

export default mongoose.model("Holiday", holidaySchema);