import React, { useMemo } from "react";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
} from "antd";

import {
  useGetAdminAttendanceQuery,
  useGetAdminSummaryQuery,
} from "../redux/attendanceApi";

import {
  useCheckAuthQuery,
  useGetUsersQuery,
} from "../redux/userApi";

const { Title, Text } = Typography;
import { useTheme } from "../context/ThemeContext";

const AttendanceAdmin = () => {

  const { theme, toggleTheme } = useTheme();


  /* ================= AUTH ================= */
  const { data: authRes, isLoading: authLoading } = useCheckAuthQuery();

  const user = authRes?.user;
  const department = user?.department;

  /* ================= CURRENT MONTH ================= */
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  /* ================= USERS ================= */
  const { data: usersRes } = useGetUsersQuery();
  const departmentStudents = useMemo(() => {
    const users =
      usersRes?.users ||
      usersRes?.data ||
      usersRes ||
      [];

    return users.filter(
      (u) =>
        u.role?.toLowerCase() === "student" &&
        u.department === department
    );
  }, [usersRes, department]);

  console.log(departmentStudents, "departmentStundets")

  /* ================= ATTENDANCE ================= */
  const { data: attendanceRes, isLoading: attendanceLoading } =
    useGetAdminAttendanceQuery(
      { department },
      { skip: !department }
    );

  const attendanceList = attendanceRes?.data || [];

  console.log(attendanceList, "attendanceList")

  /* ================= MONTHLY SUMMARY (FIXED) ================= */
  const { data: summaryRes, isLoading: summaryLoading } =
    useGetAdminSummaryQuery(
      { department, month, year },
      { skip: !department }
    );

  const summaryList = Array.isArray(summaryRes?.data)
    ? summaryRes.data
    : summaryRes?.summary || [];

  /* ================= DEPARTMENT STATS ================= */
  const departmentStats = useMemo(() => {
    const deptData = attendanceList.filter(
      (a) => a.department === department
    );

    const total = deptData.length;

    const present = deptData.filter(
      (a) => a.status === "present"
    ).length;

    const absent = total - present;

    return {
      students: departmentStudents.length,
      avgAttendance:
        total === 0 ? 0 : Math.round((present / total) * 100),
      presentToday: present,
      absentToday: absent,
    };
  }, [attendanceList, departmentStudents, department]);

  /* ================= STUDENT TABLE ================= */
  const studentAttendanceTable = useMemo(() => {
    const grouped = {};

    attendanceList.forEach((rec) => {
      const id = rec?.studentId?._id;
      const name = rec?.studentId?.name || "Unknown";

      if (!id) return;

      if (!grouped[id]) {
        grouped[id] = {
          key: id,
          name,
          total: 0,
          present: 0,
        };
      }

      grouped[id].total += 1;

      if (rec.status === "present") {
        grouped[id].present += 1;
      }
    });

    return Object.values(grouped).map((s) => ({
      ...s,
      percentage:
        s.total === 0
          ? 0
          : Math.round((s.present / s.total) * 100),
    }));
  }, [attendanceList]);

  /* ================= MONTHLY SUBJECT SUMMARY ================= */
  const monthlySummary = useMemo(() => {
    if (!summaryRes?.data || !Array.isArray(summaryRes.data)) return [];

    return summaryRes.data.map((item, index) => ({
      key: item.department || index,
      department: item.department ?? "-",
      present: item.present ?? 0,
      absent: item.absent ?? 0,
      total: item.total ?? 0,
      percentage: item.percentage ?? 0,
    }));
  }, [summaryRes]);

  console.log(monthlySummary, "monthlySummary")

  /* ================= TABLE ================= */
  const attendanceColumns = [
    {
      title: "Student",
      render: (_, r) => r.studentId?.name || "Unknown",
    },
    { title: "Subject", dataIndex: "subject" },
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
        <>
          <div>{r.staffId?.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.staffId?.department}
          </Text>
        </>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (value) =>
        new Date(value).toLocaleString("en-IN"),
    },
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading || summaryLoading) {
    return <Spin fullscreen />;
  }

  return (
    <div style={{ padding: 16 }}>
      <Title level={3}
        style={{ color: theme === "dark" ? "#fff" : "#000" }}
      >
        {department} Department Attendance
      </Title>

      {/* ================= STATS ================= */}
      <Row gutter={[16, 16]} align="stretch">

        <Col xs={24} md={8} style={{ display: "flex" }}>


          <Card
            className="rounded-xl shadow-sm"
            style={{
              width: "100%",
              height: "100%",
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              border:
                theme === "dark"
                  ? "1px solid #2a2a2a"
                  : "1px solid #e5e7eb",
            }}
          >
            <div className="flex flex-col justify-between h-full">

              {/* Label */}
              <span
                className="text-sm font-medium"
                style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
              >
                Students
              </span>

              {/* Value */}
              <span
                className="text-3xl font-semibold mt-2"
                style={{ color: theme === "dark" ? "#fff" : "#111827" }}
              >
                {departmentStats.students}
              </span>

            </div>
          </Card>


        </Col>

        <Col xs={24} md={8} style={{ display: "flex" }}>
          <Card style={{
            width: "100%", height: "100%", background: theme === "dark" ? "#1f1f1f" : "#fff", 
            border:
              theme === "dark"
                ? "1px solid #2a2a2a"
                : "1px solid #e5e7eb",
          }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Avg Attendance</Title>
            <Progress percent={departmentStats.avgAttendance} style={{ color: theme === "dark" ? "#fff" : "#000" }} className={theme === "dark" ? "dark-indicator" : ""} />
          </Card>
        </Col>

        <Col xs={24} md={8} style={{ display: "flex" }}>
          <Card style={{
            width: "100%", height: "100%", background: theme === "dark" ? "#1f1f1f" : "#fff",

            border:
              theme === "dark"
                ? "1px solid #2a2a2a"
                : "1px solid #e5e7eb",

          }}>
            <Tag color="green">
              Present: {departmentStats.presentToday}
            </Tag>

            <Tag color="red" style={{ marginLeft: 8 }}>
              Absent: {departmentStats.absentToday}
            </Tag>
          </Card>
        </Col>

      </Row>

      {/* ================= STUDENT OVERVIEW ================= */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        style={{ marginTop: 20, }}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            Student Attendance Overview
          </span>
        }
      >
        <Table
          className={theme === "dark" ? "dark-table" : ""}
          scroll={{ x: true }}
          dataSource={studentAttendanceTable}
          rowKey="key"
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Student", dataIndex: "name" },
            { title: "Total", dataIndex: "total" },
            { title: "Present", dataIndex: "present" },
            {
              title: "Attendance %",
              dataIndex: "percentage",
              render: (value) => (
                <Progress
                  className={theme === "dark" ? "dark-indicator" : ""}
                  percent={value}
                  size="small"
                  status={value < 75 ? "exception" : "active"}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* ================= MONTHLY SUBJECT ================= */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        style={{ marginTop: 20 }}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            Monthly Subject Summary
          </span>
        }
      >
        <Table
          className={theme === "dark" ? "dark-table" : ""}
          dataSource={monthlySummary}
          rowKey="key"
          pagination={false}
          columns={[
            { title: "department", dataIndex: "department" },
            { title: "Total", dataIndex: "total" },
            { title: "Present", dataIndex: "present" },
            {
              title: "Percentage",
              dataIndex: "percentage",
              render: (value) => (
                <Tag color={value >= 75 ? "green" : "red"}>
                  {value}%
                </Tag>
              ),
            },
          ]}
        />
      </Card>

      {/* ================= FULL LOG ================= */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        style={{ marginTop: 20 }}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            All Attendance Records
          </span>
        }
      >
        <Table
          scroll={{ x: true }}
          dataSource={attendanceList}
          rowKey="_id"
          className={theme === "dark" ? "dark-table" : ""}
          columns={attendanceColumns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AttendanceAdmin;