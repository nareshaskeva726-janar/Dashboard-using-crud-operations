import React, { useMemo } from "react";
import {
  Table,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
  Empty,
} from "antd";

import dayjs from "dayjs";

import {
  useGetMyAttendanceQuery,
  useGetStudentSummaryQuery,
} from "../redux/attendanceApi";

import { useCheckAuthQuery } from "../redux/userApi";

const { Title, Text } = Typography;

import { useTheme } from "../context/ThemeContext";


const AttendanceStudent = () => {


  const { theme, toggleTheme } = useTheme();

  /* ================= AUTH ================= */
  const { data: authUser, isLoading: authLoading } =
    useCheckAuthQuery();

  const student = authUser?.user;
  const subjects = student?.subjects || [];

  /* ================= CURRENT MONTH ================= */
  const month = dayjs().month() + 1;
  const year = dayjs().year();

  /* ================= ATTENDANCE ================= */
  const {
    data: attendanceRes,
    isLoading: attendanceLoading,
    error,
  } = useGetMyAttendanceQuery(undefined, {
    skip: !student,
  });

  const attendanceList = Array.isArray(attendanceRes?.data)
    ? attendanceRes.data
    : [];

  /* ================= STUDENT MONTHLY SUMMARY (FIXED) ================= */
  const { data: summaryRes, isLoading: summaryLoading } =
    useGetStudentSummaryQuery(
      { month, year }, // ⭐ FIXED HERE
      { skip: !student }
    );

  const summaryList = Array.isArray(summaryRes?.data)
    ? summaryRes.data
    : [];

  /* ================= DAILY TABLE ================= */
  const attendanceData = useMemo(() => {
    return attendanceList.map((item, index) => {
      const dateObj = item?.date ? new Date(item.date) : null;

      return {
        key: item._id || index,
        date: dateObj
          ? dateObj.toLocaleDateString("en-IN")
          : "-",
        time: dateObj
          ? dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
          : "-",
        subject: item.subject || "-",
        department: item.department || "-",
        status: item.status || "-",
        staffName: item?.staffId?.name || "Unknown",
        staffRole: item?.staffId?.role || "Staff",
      };
    });
  }, [attendanceList]);

  /* ================= MONTHLY ================= */
  const monthlyData = useMemo(() => {
    return summaryList.map((item, index) => ({
      key: index,
      subject: item.subject,
      totalClasses: item.total,
      attended: item.present,
      percent: Number(item.percentage) || 0,
    }));
  }, [summaryList]);

  /* ================= OVERALL ================= */
  const overallPercentage = useMemo(() => {
    if (!monthlyData.length) return 0;

    const total = monthlyData.reduce(
      (s, i) => s + i.totalClasses,
      0
    );

    const attended = monthlyData.reduce(
      (s, i) => s + i.attended,
      0
    );

    return total
      ? Math.round((attended / total) * 100)
      : 0;
  }, [monthlyData]);

  const riskStatus =
    overallPercentage >= 75
      ? "Good Standing"
      : "Low Attendance";

  /* ================= COLUMNS ================= */
  const monthlyColumns = [
    { title: "Subject", dataIndex: "subject" },
    { title: "Total", dataIndex: "totalClasses" },
    { title: "Attended", dataIndex: "attended" },
    {
      title: "Attendance %",
      dataIndex: "percent",
      render: (v) => (
        <Progress
          className={theme === "dark" ? "dark-indicator" : ""}
          percent={v}
          size="small"
          status={v < 75 ? "exception" : "active"}
        />
      ),
    },
  ];

  const attendanceColumns = [
    { title: "Date", dataIndex: "date" },
    { title: "Time", dataIndex: "time" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Dept",
      dataIndex: "department",
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "present" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Marked By",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {r.staffName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.staffRole}
          </Text>
        </div>
      ),
    },
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading || summaryLoading)
    return <Spin fullscreen />;

  if (error)
    return <Empty description="No attendance data found" />;

  /* ================= CARD STYLE ================= */
  const cardStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        padding: 16,
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <Title level={3} 
          style={{ color: theme === "dark" ? "#fff" : "#000", marginBottom: 0 }}
        >
          My Attendance
        </Title>

        <Text type="secondary"
          style={{ color: theme === "dark" ? "#fff" : "#000" }}
        >
          Track your attendance performance
        </Text>
      </div>

      {/* CARDS */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: theme === "dark" ? "#333" : "#fff", height: "100%" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Total Subjects</Title>
            <Title level={2} style={{ color: theme === "dark" ? "lightblue" : "darkblue" }}>{subjects.length}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: theme === "dark" ? "#333" : "#fff", height: "100%" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Overall Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {overallPercentage}%
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card style={{ background: theme === "dark" ? "#333" : "#fff", height: "100%" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Status</Title>
            <Tag
              color={
                overallPercentage >= 75 ? "green" : "red"
              }
            >
              {riskStatus}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* MONTHLY SUMMARY */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}

        style={{ marginTop: 16 }} title={<span style={{ color: theme === "dark" ? "#fff" : "#000" }}>Monthly Summary</span>}>
        {monthlyData.length ? (
          <Table
            className={theme === "dark" ? "dark-table" : ""}
            dataSource={monthlyData}
            columns={monthlyColumns}
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <Empty />
        )}
      </Card>

      {/* DAILY ATTENDANCE */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}

        style={{ marginTop: 16 }} title={<span style={{ color: theme === "dark" ? "#fff" : "#000" }}>Attendance Records</span>}>
        {attendanceData.length ? (
          <Table
            className={theme === "dark" ? "dark-table" : ""}

            dataSource={attendanceData}
            columns={attendanceColumns}
            pagination={{ pageSize: 6 }}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
};

export default AttendanceStudent;