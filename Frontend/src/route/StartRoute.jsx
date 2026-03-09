import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AllUsers from "../pages/AllUsers";
import AddUsers from "../pages/AddUsers";
import Settings from "../pages/Settings";
import DashBoardLayout from "../layout/DashBoardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const StartRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashBoardLayout />}>
                    <Route path="users" element={<AllUsers />} />
                    <Route path="add-user" element={<AddUsers />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>
            
        </Routes>
    );
};

export default StartRoute;