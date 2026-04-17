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
  const isAdmin = user?.role === "admin";

  /* ================= USERS ================= */
  const { data: usersRes } = useGetUsersQuery();

  const departmentStudents = useMemo(() => {
    return (
      usersRes?.users?.filter(
        (u) => u.role === "student" && u.department === department
      ) || []
    );
  }, [usersRes, department]);

  /* ================= ATTENDANCE ================= */
  const { data: attendanceRes, isLoading: attendanceLoading } =
    useGetAdminAttendanceQuery(
      { department },
      { skip: !department || !isAdmin }
    );

  const attendanceList = attendanceRes?.data || [];

  /* ================= ADMIN SUMMARY (FIXED) ================= */
  const { data: summaryRes, isLoading: summaryLoading } =
    useGetAdminSummaryQuery(
      { department },
      { skip: !department || !isAdmin }
    );

  const summaryList = summaryRes?.data || [];

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
      avgAttendance: total === 0 ? 0 : Math.round((present / total) * 100),
      presentToday: present,
      absentToday: absent,
    };
  }, [attendanceList, departmentStudents, department]);

  /* ================= STUDENT WISE TABLE ================= */
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
        s.total === 0 ? 0 : Math.round((s.present / s.total) * 100),
    }));
  }, [attendanceList]);

  /* ================= MONTHLY SUBJECT SUMMARY (FIXED) ================= */
  const monthlySummary = useMemo(() => {
    const grouped = {};

    summaryList.forEach((rec) => {
      const subject = rec?.subject;
      if (!subject) return;

      if (!grouped[subject]) {
        grouped[subject] = { total: 0, present: 0 };
      }

      grouped[subject].total += 1;

      if (rec.status === "present") {
        grouped[subject].present += 1;
      }
    });

    return Object.keys(grouped).map((subject) => {
      const total = grouped[subject].total;
      const present = grouped[subject].present;

      return {
        key: subject,
        subject,
        total,
        present,
        percentage:
          total === 0 ? 0 : Math.round((present / total) * 100),
      };
    });
  }, [summaryList]);

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
      title: "Marked By (Staff)",
      render: (_, r) => (
        <div>
          <div>{r.staffId?.name || "Unknown Staff"}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.staffId?.role || "Staff"}
          </Text>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (value) =>
        value
          ? new Date(value).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "-",
    },
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading || summaryLoading) {
    return <Spin fullscreen />;
  }

  /* ================= ACCESS CONTROL ================= */
  if (!isAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <Title level={4} type="danger">
          Access Denied (Admin Only)
        </Title>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, background: "#f5f7fb" }}>
      <Title level={3}>{department} Department Attendance</Title>
      <Text type="secondary">Attendance analytics dashboard</Text>

      {/* STATS */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Title level={5}>Students</Title>
            <Title level={2}>{departmentStats.students}</Title>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Avg Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {departmentStats.avgAttendance}%
            </Title>
            <Progress percent={departmentStats.avgAttendance} />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Department Summary</Title>
            <Tag color="green">
              Present: {departmentStats.presentToday}
            </Tag>
            <Tag color="red" style={{ marginLeft: 8 }}>
              Absent: {departmentStats.absentToday}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* STUDENT TABLE */}
      <Card style={{ marginTop: 20 }} title="Student Attendance Overview">
        <Table
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

      {/* MONTHLY SUBJECT */}
      <Card style={{ marginTop: 20 }} title="Monthly Subject Summary">
        <Table
          dataSource={monthlySummary}
          rowKey="key"
          pagination={false}
          columns={[
            { title: "Subject", dataIndex: "subject" },
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

      {/* FULL LOG */}
      <Card style={{ marginTop: 20 }} title="All Attendance Records">
        <Table
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