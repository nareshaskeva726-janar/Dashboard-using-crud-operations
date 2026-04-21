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
  CartesianGrid,
  ResponsiveContainer,
  Legend
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


  const kpiCardStyle = {
    background: theme === "dark" ? "#141414" : "#ffffff",
    borderRadius: "16px",
    height: "140px", // ✅ key fix
    padding: "16px 20px",
    boxShadow:
      theme === "dark"
        ? "0 6px 20px rgba(0,0,0,0.6)"
        : "0 6px 16px rgba(0,0,0,0.08)",
    border: "none",
    display: "flex",
  };

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
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderRadius: "16px",
              padding: "16px 20px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 20px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
              height: "180px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

              {/* Left Content */}
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Total Users
                </div>

                

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  {users?.length || 0}
                </div>
              </div>

              {/* Right Icon */}
              <div
                style={{
                  height: "48px",
                  width: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                👥
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderRadius: "16px",
              padding: "16px 20px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 20px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: theme === "dark" ? "#9ca3af" : "#6b7280",
                }}
              >
                Attendance %
              </div>
            </div>

            {/* Value + Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: theme === "dark" ? "#fff" : "#111827",
                }}
              >
                {attendancePercent}%
              </div>

              {/* Status Badge */}
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "500",
                  background:
                    attendancePercent >= 75
                      ? "#dcfce7"
                      : attendancePercent >= 50
                        ? "#fef9c3"
                        : "#fee2e2",
                  color:
                    attendancePercent >= 75
                      ? "#166534"
                      : attendancePercent >= 50
                        ? "#854d0e"
                        : "#991b1b",
                }}
              >
                {attendancePercent >= 75
                  ? "Good"
                  : attendancePercent >= 50
                    ? "Average"
                    : "Poor"}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                marginTop: "12px",
                height: "8px",
                background: theme === "dark" ? "#2a2a2a" : "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${attendancePercent}%`,
                  height: "100%",
                  background:
                    attendancePercent >= 75
                      ? "#22c55e"
                      : attendancePercent >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderRadius: "16px",
              padding: "16px 20px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 20px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

              {/* Left */}
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Messages
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  {messagesArray.length}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#22c55e",
                    marginTop: "4px",
                  }}
                >
                  ● Active chat activity
                </div>
              </div>

              {/* Icon */}
              <div
                style={{
                  height: "48px",
                  width: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#fff",
                }}
              >
                💬
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderRadius: "16px",
              padding: "16px 20px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 20px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

              {/* Left content */}
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Projects
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  {submittedProjects.length}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6366f1",
                    marginTop: "4px",
                  }}
                >
                  ● Work in progress
                </div>
              </div>

              {/* Icon */}
              <div
                style={{
                  height: "48px",
                  width: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#fff",
                }}
              >
                📁
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} md={12}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              color: theme === "dark" ? "#f5f5f5" : "#1f2937",
              borderRadius: "16px",
              padding: "16px",
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.6)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              border: "none",
            }}
            title={
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  User Distribution
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Breakdown of users by category
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  cornerRadius={6}
                >
                  {userData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#ccc" : "#555",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>




        <Col xs={24} md={12}>


          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              color: theme === "dark" ? "#f5f5f5" : "#1f2937",
              borderRadius: "16px",
              padding: "16px",
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.6)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
              border: "none",
            }}
            title={
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  Monthly Summary
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Attendance overview for the month
                </div>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#333" : "#e5e7eb"}
                />

                <XAxis
                  dataKey="name"
                  stroke={theme === "dark" ? "#aaa" : "#555"}
                />

                <YAxis
                  stroke={theme === "dark" ? "#aaa" : "#555"}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#888" }}
                />

                <Bar
                  dataKey="present"
                  radius={[8, 8, 0, 0]}
                  fill="url(#colorGradient)"
                />

                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>



        <Col xs={24} md={12}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              color: theme === "dark" ? "#f5f5f5" : "#1f2937",
              borderRadius: "16px",
              padding: "16px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 24px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
              height: "100%"
            }}
            title={
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  💬 Chat Stats
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Message distribution by type
                </span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chatData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={5}
                  cornerRadius={8}
                >
                  {chatData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                {/* Center Total */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    fill: theme === "dark" ? "#fff" : "#111",
                  }}
                >
                  {chatData.reduce((a, b) => a + b.value, 0)}
                </text>

                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                    border: "none",
                    borderRadius: "10px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#ccc" : "#555",
                    paddingTop: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>


        <Col xs={24} md={12}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              color: theme === "dark" ? "#f5f5f5" : "#1f2937",
              borderRadius: "16px",
              padding: "16px",
              boxShadow:
                theme === "dark"
                  ? "0 6px 24px rgba(0,0,0,0.6)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              border: "none",
            }}
            title={
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: theme === "dark" ? "#fff" : "#111827",
                  }}
                >
                  📊 Project Stats
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Completion status overview
                </div>
              </div>
            }
          >
            {/* Quick Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                fontSize: "13px",
              }}
            >
              {assignmentData.map((item, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ color: "#888" }}>{item.name}</div>
                  <div style={{ fontWeight: "600" }}>{item.value}</div>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={assignmentData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  cornerRadius={10}
                >
                  {assignmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                {/* Center % (example: completed %) */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    fill: theme === "dark" ? "#fff" : "#111",
                  }}
                >
                  {
                    Math.round(
                      (assignmentData[0]?.value /
                        assignmentData.reduce((a, b) => a + b.value, 0)) *
                      100
                    ) + "%"
                  }
                </text>

                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                    border: "none",
                    borderRadius: "10px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#ccc" : "#555",
                    paddingTop: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashBoardPage;