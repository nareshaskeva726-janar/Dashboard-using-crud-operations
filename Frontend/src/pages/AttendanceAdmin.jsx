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
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import {
  useCheckAuthQuery,
  useGetUsersQuery,
} from "../redux/userApi";

const { Title, Text } = Typography;

const AttendanceAdmin = () => {
  /* ================= AUTH ================= */
  const { data: authRes, isLoading: authLoading } =
    useCheckAuthQuery();

  const user = authRes?.user;
  const department = user?.department;

  const isAdmin = user?.role === "admin";

  /* ================= USERS ================= */
  const { data: usersRes } = useGetUsersQuery();

  const departmentStudents = useMemo(() => {
    if (!usersRes?.users || !department) return [];

    return usersRes.users.filter(
      (u) =>
        u.role === "student" &&
        u.department === department
    );
  }, [usersRes, department]);

  /* ================= ATTENDANCE ================= */
  const {
    data: attendanceRes,
    isLoading: attendanceLoading,
  } = useGetAdminAttendanceQuery(
    { department },
    {
      skip: !department || !isAdmin,
    }
  );

  const attendanceList = attendanceRes?.data || [];

  /* ================= MONTHLY ================= */
  const {
    data: summaryRes,
    isLoading: summaryLoading,
  } = useGetMonthlySummaryQuery(
    { department },
    {
      skip: !department || !isAdmin,
    }
  );

  const summaryList = summaryRes?.data || [];

  /* ================= STATS ================= */
  const departmentStats = useMemo(() => {
    const total = attendanceList.length;

    const present = attendanceList.filter(
      (a) => a.status === "present"
    ).length;

    return {
      students: departmentStudents.length,
      avgAttendance:
        total === 0
          ? 0
          : Math.round((present / total) * 100),
      presentToday: present,
      absentToday: total - present,
    };
  }, [attendanceList, departmentStudents]);

  /* ================= TABLE: STUDENTS ================= */
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

  /* ================= MONTHLY SUBJECT ================= */
  const monthlySummary = useMemo(() => {
    const grouped = {};

    summaryList.forEach((rec) => {
      const subject = rec?.subject;
      if (!subject) return;

      if (!grouped[subject]) {
        grouped[subject] = {
          total: 0,
          present: 0,
        };
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
          total === 0
            ? 0
            : Math.round((present / total) * 100),
      };
    });
  }, [summaryList]);

  /* ================= COLUMNS ================= */
  const studentColumns = [
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
  ];

  const monthlyColumns = [
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
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading || summaryLoading) {
    return <Spin fullscreen />;
  }

  /* ================= BLOCK NON-ADMIN ================= */
  if (!isAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <Title level={4} type="danger">
          Access Denied (Admin Only)
        </Title>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 16, background: "#f5f7fb" }}>
      <Title level={3}>
        {department} Department Attendance
      </Title>
      <Text type="secondary">
        Students attendance analytics
      </Text>

      {/* CARDS */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Title level={5}>Students</Title>
            <Title level={2}>
              {departmentStats.students}
            </Title>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Avg Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {departmentStats.avgAttendance}%
            </Title>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Title level={5}>Today</Title>
            <Tag color="green">
              Present: {departmentStats.presentToday}
            </Tag>
            <br />
            <Tag color="red">
              Absent: {departmentStats.absentToday}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* TABLE 1 */}
      <Card
        style={{ marginTop: 20 }}
        title="Student Attendance Overview"
      >
        <Table
          dataSource={studentAttendanceTable}
          columns={studentColumns}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* TABLE 2 */}
      <Card
        style={{ marginTop: 20 }}
        title="Monthly Subject Summary"
      >
        <Table
          dataSource={monthlySummary}
          columns={monthlyColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AttendanceAdmin;