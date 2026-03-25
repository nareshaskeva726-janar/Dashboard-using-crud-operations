import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AllUsers from "../pages/AllUsers";
import AddUsers from "../pages/AddUsers";
import Settings from "../pages/Settings";
import DashBoardLayout from "../layout/DashBoardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ChatBot from "../pages/ChatBot";
import Assignments from "../pages/Assignments";
import AssignmentCheck from "../components/AssignmentCheck";
import AttendanceStaff from "../pages/AttendanceStaff";
import Attendance from "../pages/Attendance";
import TimeTable from "../pages/TimeTable";


const StartRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashBoardLayout />}>

                    <Route path="users" element={<AllUsers />} />
                    <Route path="add-user" element={<AddUsers />} />
                    <Route path="chat" element={<ChatBot />} />
                    <Route path="assignments" element={<Assignments />} />
                    <Route path="assignmentcheck" element={<AssignmentCheck />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="attendancestaff" element={<AttendanceStaff />} />
                     <Route path="timetable" element={<TimeTable />} />
                    <Route path="settings" element={<Settings />} />

                </Route>
            </Route>
        </Routes>
    );
};

export default StartRoute;