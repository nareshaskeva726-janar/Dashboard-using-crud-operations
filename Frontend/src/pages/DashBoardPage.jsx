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
  useGetAdminProjectsQuery, // ✅ ADMIN API
} from "../redux/projectApi";

const { Title } = Typography;

const DashBoardPage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  /* ================= USERS ================= */
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  /* ================= MESSAGES ================= */
  const { data: messages, isLoading: messagesLoading } =
    useGetAllMessagesQuery();

  /* ================= PROJECT APIS ================= */

  // SUPERADMIN
  const { data: superadminProjects, isLoading: superLoading } =
    useGetAllProjectsSuperadminQuery(undefined, {
      skip: user.role !== "superadmin",
    });

  // STAFF
  const { data: staffProjects, isLoading: staffLoading } =
    useGetStaffProjectsQuery(undefined, {
      skip: user.role !== "staff",
    });

  // ✅ ADMIN PROJECTS
  const { data: adminProjects, isLoading: adminLoading } =
    useGetAdminProjectsQuery(undefined, {
      skip: user.role !== "admin",
    });

    console.log(adminProjects, "adminProjects");

  // STUDENT
  const { data: studentProjects, isLoading: studentLoading } =
    useGetMyProjectsQuery(undefined, {
      skip: user.role !== "student",
    });

  /* ================= NORMALIZE FUNCTION ================= */
  const normalize = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.projects)) return data.projects;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  /* ================= ROLE BASED PROJECTS ================= */
  const projectsArray = useMemo(() => {
    if (user.role === "superadmin")
      return normalize(superadminProjects);

    if (user.role === "staff")
      return normalize(staffProjects);

    if (user.role === "student")
      return normalize(studentProjects);

    // ✅ ADMIN → already filtered in backend
    if (user.role === "admin")
      return normalize(adminProjects);

    return [];
  }, [
    user.role,
    superadminProjects,
    staffProjects,
    studentProjects,
    adminProjects,
  ]);

  /* ================= SUBMITTED PROJECTS ================= */
  const submittedProjects = useMemo(() => {
    return projectsArray.filter((p) => p.projectFile);
  }, [projectsArray]);

  /* ================= NORMALIZE MESSAGES ================= */
  const messagesArray = Array.isArray(messages)
    ? messages
    : messages?.messages || [];

  /* ================= USER COUNT ================= */
  const userCounts = useMemo(() => {
    if (!users) return { students: 0, staff: 0, admins: 0 };

    const counts = { students: 0, staff: 0, admins: 0 };

    users.forEach((u) => {
      if (u.role === "student") counts.students++;
      else if (u.role === "staff") counts.staff++;
      else if (u.role === "admin") counts.admins++;
    });

    return counts;
  }, [users]);

  const userData = [
    { name: "Students", value: userCounts.students },
    { name: "Staff", value: userCounts.staff },
    { name: "Admins", value: userCounts.admins },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

  /* ================= CHAT DATA ================= */
  const chatData = useMemo(() => {
    const totalMessages = messagesArray.length;

    const activeChats = new Set(
      messagesArray.map(
        (msg) => `${msg.senderId}-${msg.receiverId}`
      )
    ).size;

    return [
      { name: "Messages", value: totalMessages },
      { name: "Active Chats", value: activeChats },
    ];
  }, [messagesArray]);

  /* ================= PROJECT STATUS ================= */
  const assignmentData = useMemo(() => {
    const submitted = submittedProjects.length;

    return [
      { name: "Submitted", value: submitted },
      {
        name: "Pending",
        value: projectsArray.length - submitted,
      },
    ];
  }, [projectsArray, submittedProjects]);

  /* ================= LOADING ================= */
  if (
    usersLoading ||
    messagesLoading ||
    superLoading ||
    staffLoading ||
    adminLoading ||
    studentLoading
  ) {
    return (
      <Spin
        size="large"
        className="mt-10"
        style={{ display: "block", textAlign: "center" }}
      />
    );
  }

  return (
    <div className="px-3 sm:px-6 md:px-8 py-4">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold my-2">
        Welcome {user.name}!
      </h1>

      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
        Role : {user.role}
      </h3>

      <hr className="border-1 border-gray-400 mb-4" />

      <Title level={3}>Dashboard Overview</Title>

      {/* ================= KPI ================= */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Title level={5}>Total Users</Title>
            <Title level={2}>{users?.length || 0}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Title level={5}>Attendance %</Title>
            <Title level={2}>85%</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Title level={5}>Messages</Title>
            <Title level={2}>{messagesArray.length}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Title level={5}>
              {user.role === "superadmin"
                ? "All Projects"
                : user.role === "staff"
                ? "Department Projects"
                : user.role === "admin"
                ? "Department Subject Projects"
                : "My Projects"}
            </Title>
            <Title level={2}>{submittedProjects.length}</Title>
          </Card>
        </Col>
      </Row>

      {/* ================= CHARTS ================= */}
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} md={12}>
          <Card title="User Distribution">
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
          <Card title="Monthly Summary">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { day: "Mon", present: 80 },
                  { day: "Tue", present: 90 },
                  { day: "Wed", present: 75 },
                  { day: "Thu", present: 85 },
                  { day: "Fri", present: 95 },
                ]}
              >
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Chat Stats">
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
          <Card title="Project Status">
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