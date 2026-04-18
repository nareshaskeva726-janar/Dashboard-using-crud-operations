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

const AttendanceAdmin = () => {
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
  if (!summaryRes?.data) return [];

  const data = summaryRes.data;

  return [
    {
      key: data.department,
      department: data.department,
      present: data.present,
      absent: data.absent,
      total: data.total,
      percentage: data.percentage,
    },
  ];
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
      <Title level={3}>
        {department} Department Attendance
      </Title>

      {/* ================= STATS ================= */}
   <Row gutter={[16, 16]} align="stretch">

  <Col xs={24} md={8} style={{ display: "flex" }}>
    <Card style={{ width: "100%", height: "100%" }}>
      <Title level={5}>Students</Title>
      <Title level={2}>
        {departmentStats.students}
      </Title>
    </Card>
  </Col>

  <Col xs={24} md={8} style={{ display: "flex" }}>
    <Card style={{ width: "100%", height: "100%" }}>
      <Title level={5}>Avg Attendance</Title>
      <Progress percent={departmentStats.avgAttendance} />
    </Card>
  </Col>

  <Col xs={24} md={8} style={{ display: "flex" }}>
    <Card style={{ width: "100%", height: "100%" }}>
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
        style={{ marginTop: 20 }}
        title="Student Attendance Overview"
      >
        <Table
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
        style={{ marginTop: 20 }}
        title="Monthly Subject Summary"
      >
        <Table
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
        style={{ marginTop: 20 }}
        title="All Attendance Records"
      >
        <Table
          scroll={{ x: true }}
          dataSource={attendanceList}
          rowKey="_id"
          columns={attendanceColumns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AttendanceAdmin;