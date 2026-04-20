import React, { useMemo } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useGetUsersQuery } from "../redux/userApi";
import { useGetAllMessagesQuery } from "../redux/chatApi";

import {
  useGetAllProjectsSuperadminQuery,
  useGetStaffProjectsQuery,
  useGetMyProjectsQuery,
  useGetAdminProjectsQuery,
} from "../redux/projectApi";

import {
  useGetMonthlySummaryQuery,
  useGetStaffSummaryQuery,
  useGetStudentSummaryQuery,
  useGetAdminSummaryQuery,
} from "../redux/attendanceApi";
import { useTheme } from "../context/ThemeContext";

const { Title } = Typography;

const DashBoardPage = () => {

  const { theme, toggleTheme } = useTheme();




  const user = JSON.parse(localStorage.getItem("user")) || {};

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  /* ================= USERS ================= */

  const { data: users, isLoading: usersLoading } =
    useGetUsersQuery();

  /* ================= MESSAGES ================= */

  const { data: messages, isLoading: messagesLoading } =
    useGetAllMessagesQuery();

  /* ================= PROJECTS ================= */

  const {
    data: superProjects,
    isLoading: superLoading,
  } = useGetAllProjectsSuperadminQuery(undefined, {
    skip: user.role !== "superadmin",
  });

  const {
    data: adminProjects,
    isLoading: adminLoading,
  } = useGetAdminProjectsQuery(undefined, {
    skip: user.role !== "admin",
  });

  const {
    data: staffProjects,
    isLoading: staffLoading,
  } = useGetStaffProjectsQuery(undefined, {
    skip: user.role !== "staff",
  });

  const {
    data: studentProjects,
    isLoading: studentLoading,
  } = useGetMyProjectsQuery(undefined, {
    skip: user.role !== "student",
  });

  /* ✅ UNIVERSAL PROJECT NORMALIZER */

  const normalizeProjects = (res) => {
    if (!res) return [];

    if (Array.isArray(res)) return res;

    return (
      res.data ||
      res.projects ||
      res.myProjects ||
      res.allProjects ||
      res.result ||
      []
    );
  };

  /* ✅ ROLE BASED PROJECT SELECTION */

  const roleProjectMap = {
    superadmin: superProjects,
    admin: adminProjects,
    staff: staffProjects,
    student: studentProjects,
  };

  const projects = useMemo(
    () => normalizeProjects(roleProjectMap[user.role]),
    [user.role, roleProjectMap]
  );

  const submittedProjects = projects.filter(
    (p) => p.projectFile
  );

  const assignmentData = [
    { name: "Submitted", value: submittedProjects.length },
    {
      name: "Pending",
      value: projects.length - submittedProjects.length,
    },
  ];

  /* ================= ATTENDANCE ================= */

  const { data: superSummary } =
    useGetMonthlySummaryQuery(
      { month, year },
      { skip: user.role !== "superadmin" }
    );

  const department = user.department;

  const { data: adminSummary } =
    useGetAdminSummaryQuery(
      { department, month, year },
      { skip: user.role !== "admin" || !department }
    );

  const subject = user.subjects?.[0];

  const { data: staffSummary } =
    useGetStaffSummaryQuery(
      { department, subject, month, year },
      { skip: user.role !== "staff" || !subject }
    );

  const { data: studentSummary } =
    useGetStudentSummaryQuery(
      { month, year },
      { skip: user.role !== "student" }
    );

  const normalizeSummary = (data) => {
    if (!data) return [];
    if (Array.isArray(data?.data)) return data.data;
    if (data?.data && typeof data.data === "object")
      return [data.data];
    if (Array.isArray(data)) return data;
    return [];
  };

  const summaryArray = useMemo(() => {
    if (user.role === "superadmin")
      return normalizeSummary(superSummary);
    if (user.role === "admin")
      return normalizeSummary(adminSummary);
    if (user.role === "staff")
      return normalizeSummary(staffSummary);
    if (user.role === "student")
      return normalizeSummary(studentSummary);
    return [];
  }, [
    user.role,
    superSummary,
    adminSummary,
    staffSummary,
    studentSummary,
  ]);

  const attendancePercent = useMemo(() => {
    if (!summaryArray.length) return 0;

    const total = summaryArray.reduce(
      (s, i) => s + (i.total || 0),
      0
    );

    const present = summaryArray.reduce(
      (s, i) => s + (i.present || 0),
      0
    );

    return total
      ? Math.round((present / total) * 100)
      : 0;
  }, [summaryArray]);

  const monthlyChartData = useMemo(() => {
    return summaryArray.map((item) => ({
      name:
        item.subject ||
        item.department ||
        "Attendance",
      present: item.present || 0,
    }));
  }, [summaryArray]);

  /* ================= USERS COUNT ================= */

  const userCounts = useMemo(() => {
    if (!users) return { students: 0, staff: 0, admins: 0 };

    const counts = { students: 0, staff: 0, admins: 0 };

    users.forEach((u) => {
      if (u.role === "student") counts.students++;
      if (u.role === "staff") counts.staff++;
      if (u.role === "admin") counts.admins++;
    });

    return counts;
  }, [users]);

  const userData = [
    { name: "Students", value: userCounts.students },
    { name: "Staff", value: userCounts.staff },
    { name: "Admins", value: userCounts.admins },
  ];

  /* ================= CHAT ================= */

  const messagesArray = Array.isArray(messages)
    ? messages
    : messages?.messages || [];

  const chatData = [
    { name: "Messages", value: messagesArray.length },
    {
      name: "Active Chats",
      value: new Set(
        messagesArray.map(
          (m) => `${m.senderId}-${m.receiverId}`
        )
      ).size,
    },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

  /* ================= LOADING ================= */

  if (
    usersLoading ||
    messagesLoading ||
    superLoading ||
    adminLoading ||
    staffLoading ||
    studentLoading
  )
    return <Spin size="large" className="mt-10 block text-center" />;

  /* ================= UI ================= */

  return (
    <div className="px-3 sm:px-6 md:px-8 py-4">

      <div style={{ marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, }}>
          Welcome, <span style={{ color: "#1677ff" }}>{user.name}</span>
        </h1>

        <h3 style={{ fontSize: 18, marginTop: 4 }}>
          Role : {user.role}
        </h3>

        <Title
          level={3}
          style={{
            marginTop: 16,
            borderBottom: "3px solid #1677ff",
            display: "inline-block",
            paddingBottom: 6,
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          Dashboard Overview
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }} >Total Users</Title>
            <Title level={2} style={{ color: theme === "dark" ? "#fff" : "#000" }} >{users?.length || 0}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }} >Attendance %</Title>
            <Title level={2} style={{ color: theme === "dark" ? "#fff" : "#000" }} >{attendancePercent}%</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Messages</Title>
            <Title level={2} style={{ color: theme === "dark" ? "#fff" : "#000" }}>{messagesArray.length}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}

          >
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Projects</Title>
            <Title level={2} style={{ color: theme === "dark" ? "#fff" : "#000" }}>{submittedProjects.length}</Title>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} md={12}>
          <Card

            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}

            title={
              <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                User Distribution
              </span>
            }>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={userData} dataKey="value" outerRadius={80} label>
                  {userData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>




        <Col xs={24} md={12}>


          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}

            title={
              <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                Monthly Summary
              </span>
            }>


            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>



        <Col xs={24} md={12}>
          <Card

            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}



            title={
              <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                Chat stats
              </span>
            }>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chatData} dataKey="value" outerRadius={80} label>
                  {chatData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i + 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>


        <Col xs={24} md={12}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
            }}


              title={
              <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                Project stats
              </span>
            }>
              
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={assignmentData} dataKey="value" outerRadius={80} label>
                  {assignmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i + 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashBoardPage;