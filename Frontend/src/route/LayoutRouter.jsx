import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import AllUsers from "../pages/AllUsers";
import Settings from "../pages/Settings";
import DashBoardLayout from "../layout/DashBoardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ChatBot from "../pages/ChatBot";
import Assignments from "../pages/Assignments";
import AssignmentCheck from "../pages/AssignmentCheck";
import TimeTable from "../pages/TimeTable";
import DashBoardPage from "../pages/DashBoardPage";
import ChatList from "../pages/ChatList";
import AssignmentAdmin from "../pages/AssignmentAdmin";
import AssignmentSuperAdmin from "../pages/AssignmentSuperAdmin";
import AttendanceSuperAdmin from "../pages/AttendanceSuperAdmin";
import AttendanceAdmin from "../pages/AttendanceAdmin";
import AttendanceStaff from "../pages/AttendanceStaff";
import AttendanceStudent from "../pages/AttendanceStudent";

const LayoutRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashBoardLayout />}>
                    <Route path="dashboardpage" element={<DashBoardPage />} />
                    <Route path="users" element={<AllUsers />} />

                    <Route path="chat" element={<ChatBot />} />
                    <Route path="chathistory" element={<ChatList />} />


                    <Route path="attendancesuperadmin" element={<AttendanceSuperAdmin />} />
                    <Route path="attendanceadmin" element={<AttendanceAdmin />} />
                    <Route path="attendancestaff" element={<AttendanceStaff />} />
                    <Route path="attendancestudent" element={<AttendanceStudent />} />



                    <Route path="assignmnentsuperadmin" element={<AssignmentSuperAdmin />} />
                    <Route path="assignmentadmin" element={<AssignmentAdmin />} />
                    <Route path="assignments" element={<Assignments />} />
                    <Route path="assignmentcheck" element={<AssignmentCheck />} />




                    <Route path="timetable" element={<TimeTable />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default LayoutRouter;