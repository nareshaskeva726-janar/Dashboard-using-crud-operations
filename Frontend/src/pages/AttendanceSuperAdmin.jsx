import React, { useMemo, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Select,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
} from "antd";
import dayjs from "dayjs";

import {
  useGetAllAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import { useGetUsersQuery } from "../redux/userApi";

const { Title, Text } = Typography;

const AttendanceSuperAdmin = () => {
  const [view, setView] = useState("ALL");

  /* =============================
        API CALLS
  ==============================*/

  const { data: attendanceRes, isLoading } =
    useGetAllAttendanceQuery();

  const { data: summaryRes } =
    useGetMonthlySummaryQuery();

  const { data: usersRes } =
    useGetUsersQuery();

  const attendanceList =
    attendanceRes?.attendance || [];

  const summaryList =
    summaryRes?.summary || [];

  const users = usersRes?.users || [];

  /* =============================
        STUDENTS
  ==============================*/

  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );

  /* =============================
        DYNAMIC DEPARTMENTS
  ==============================*/

  const departments = useMemo(() => {
    const deptSet = new Set();

    students.forEach((s) =>
      deptSet.add(s.department)
    );

    attendanceList.forEach((a) =>
      deptSet.add(a.department)
    );

    return Array.from(deptSet);
  }, [students, attendanceList]);

  /* =============================
        DEPARTMENT OVERVIEW
  ==============================*/

  const departmentData = useMemo(() => {
    const grouped = {};

    // initialize from students
    students.forEach((student) => {
      const dept = student.department;

      if (!grouped[dept]) {
        grouped[dept] = {
          department: dept,
          students: 0,
          total: 0,
          present: 0,
        };
      }

      grouped[dept].students += 1;
    });

    // attendance stats
    attendanceList.forEach((rec) => {
      const dept = rec.department;

      if (!grouped[dept]) return;

      grouped[dept].total += 1;

      if (
        rec.status?.toLowerCase() === "present"
      ) {
        grouped[dept].present += 1;
      }
    });

    let result = Object.values(grouped).map(
      (d) => ({
        key: d.department,
        department: d.department,
        students: d.students,
        present: d.present,
        absent: d.total - d.present,
        avgAttendance:
          d.total === 0
            ? 0
            : Math.round(
                (d.present / d.total) * 100
              ),
      })
    );

    if (view !== "ALL") {
      result = result.filter(
        (r) => r.department === view
      );
    }

    return result;
  }, [students, attendanceList, view]);

  /* =============================
        GLOBAL STATS
  ==============================*/

  const totalStudents = students.length;

  const totalPresent =
    attendanceList.filter(
      (a) =>
        a.status?.toLowerCase() === "present"
    ).length;

  const avgAttendance =
    attendanceList.length === 0
      ? 0
      : Math.round(
          (totalPresent /
            attendanceList.length) *
            100
        );

  /* =============================
        MONTHLY SUMMARY
  ==============================*/

  const monthlySummary = useMemo(() => {
    const grouped = {};

    summaryList.forEach((rec) => {
      const dept = rec.department;

      if (!grouped[dept]) {
        grouped[dept] = {
          total: 0,
          present: 0,
        };
      }

      grouped[dept].total += 1;

      if (
        rec.status?.toLowerCase() === "present"
      ) {
        grouped[dept].present += 1;
      }
    });

    let result = Object.keys(grouped).map(
      (dept) => {
        const total = grouped[dept].total;
        const present =
          grouped[dept].present;

        return {
          key: dept,
          department: dept,
          workingDays: total,
          totalPresent: present,
          monthlyPercent:
            total === 0
              ? 0
              : Math.round(
                  (present / total) * 100
                ),
        };
      }
    );

    if (view !== "ALL") {
      result = result.filter(
        (r) => r.department === view
      );
    }

    return result;
  }, [summaryList, view]);

  /* =============================
        TABLE COLUMNS
  ==============================*/

  const columns = [
    {
      title: "Department",
      dataIndex: "department",
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    { title: "Students", dataIndex: "students" },
    {
      title: "Avg Attendance",
      dataIndex: "avgAttendance",
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={
            value < 75
              ? "exception"
              : "normal"
          }
        />
      ),
    },
    { title: "Present", dataIndex: "present" },
    { title: "Absent", dataIndex: "absent" },
  ];

  const summaryColumns = [
    {
      title: "Department",
      dataIndex: "department",
      render: (t) => (
        <Tag color="purple">{t}</Tag>
      ),
    },
    { title: "Working Days", dataIndex: "workingDays" },
    { title: "Total Present", dataIndex: "totalPresent" },
    {
      title: "Monthly %",
      dataIndex: "monthlyPercent",
      render: (value) => (
        <Tag
          color={
            value >= 75
              ? "green"
              : "red"
          }
        >
          {value}%
        </Tag>
      ),
    },
  ];

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div
      style={{
        padding: 16,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Title level={3}>
        Super Admin Attendance Dashboard
      </Title>

      {/* FILTER */}
      <Card style={{ marginTop: 16 }}>
        <Text>View Department</Text>

        <Select
          value={view}
          onChange={setView}
          style={{ width: 250 }}
        >
          <Select.Option value="ALL">
            ALL
          </Select.Option>

          {departments.map((dept) => (
            <Select.Option
              key={dept}
              value={dept}
            >
              {dept}
            </Select.Option>
          ))}
        </Select>
      </Card>

      {/* KPI */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Title level={5}>Total Students</Title>
            <Title level={2}>{totalStudents}</Title>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Total Present</Title>
            <Title level={2} style={{ color: "#52c41a" }}>
              {totalPresent}
            </Title>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Avg Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {avgAttendance}%
            </Title>
          </Card>
        </Col>
      </Row>

      {/* TABLES */}
      <Card
        style={{ marginTop: 16 }}
        title="Department-wise Attendance"
      >
        <Table
          dataSource={departmentData}
          columns={columns}
          pagination={false}
        />
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Monthly Summary"
      >
        <Table
          dataSource={monthlySummary}
          columns={summaryColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AttendanceSuperAdmin;