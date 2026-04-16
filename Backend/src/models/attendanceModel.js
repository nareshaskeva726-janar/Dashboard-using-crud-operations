import mongoose   from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    

}, {timestamps: true});

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

export default Attendance;