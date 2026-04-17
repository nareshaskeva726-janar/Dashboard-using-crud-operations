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
  Space,
  Input,
} from "antd";

import {
  useGetAllAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import { useGetUsersQuery } from "../redux/userApi";

const { Title, Text } = Typography;
const { Search } = Input;

const cardStyle = {
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const AttendanceSuperAdmin = () => {
  const [view, setView] = useState("ALL");
  const [search, setSearch] = useState("");

  // ================= API =================
  const { data: attendanceRes, isLoading } = useGetAllAttendanceQuery();
  const { data: usersRes } = useGetUsersQuery();


  const today = new Date();

  const { data: monthlyRes, isLoading: monthlyLoading } =
    useGetMonthlySummaryQuery({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });

  const attendanceList = attendanceRes?.data || [];
  const users = usersRes?.users || [];
  const monthlyList = monthlyRes?.data || [];

  // ================= STUDENTS =================
  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );

  // ================= DEPARTMENTS =================
  const departments = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.department && set.add(s.department));
    attendanceList.forEach((a) => a.department && set.add(a.department));
    return Array.from(set);
  }, [students, attendanceList]);

  // ================= FILTER STUDENTS =================
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  // ================= DEPARTMENT STATS =================
  const departmentData = useMemo(() => {
    const map = {};

    filteredStudents.forEach((s) => {
      if (!s.department) return;

      if (!map[s.department]) {
        map[s.department] = {
          department: s.department,
          students: 0,
          total: 0,
          present: 0,
        };
      }

      map[s.department].students += 1;
    });

    attendanceList.forEach((a) => {
      if (!a.department) return;

      if (!map[a.department]) {
        map[a.department] = {
          department: a.department,
          students: 0,
          total: 0,
          present: 0,
        };
      }

      map[a.department].total += 1;

      if (a.status?.toLowerCase() === "present") {
        map[a.department].present += 1;
      }
    });

    let result = Object.values(map).map((d) => {
      const absent = d.total - d.present;

      return {
        key: d.department,
        department: d.department,
        students: d.students,
        present: d.present,
        absent: absent < 0 ? 0 : absent,
        avgAttendance:
          d.total === 0 ? 0 : Math.round((d.present / d.total) * 100),
      };
    });

    if (view !== "ALL") {
      result = result.filter((r) => r.department === view);
    }

    return result;
  }, [filteredStudents, attendanceList, view]);

  // ================= LOGS =================
  const attendanceLogs = useMemo(() => {
    return attendanceList.map((a) => ({
      key: a._id,
      studentName: a.studentId?.name || "N/A",
      studentEmail: a.studentId?.email || "N/A",
      studentDept: a.studentId?.department || a.department,
      subject: a.subject,
      status: a.status,
      staffName: a.staffId?.name || "N/A",
      date: new Date(a.date).toLocaleDateString(),
    }));
  }, [attendanceList]);

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();

    return attendanceLogs.filter((l) => {
      const matchSearch =
        l.studentName?.toLowerCase().includes(q) ||
        l.studentEmail?.toLowerCase().includes(q);

      const matchDept = view === "ALL" || l.studentDept === view;

      return matchSearch && matchDept;
    });
  }, [attendanceLogs, search, view]);

  // ================= MONTHLY SUMMARY =================
  const monthlySummary = useMemo(() => {
    const map = {};

    monthlyList.forEach((item) => {
      const key = item.subject || item.department || "Unknown";

      if (!map[key]) {
        map[key] = {
          key,
          subject: item.subject || "-",
          department: item.department || "-",
          total: 0,
          present: 0,
        };
      }

      map[key].total += item.total || 0;
      map[key].present += item.present || 0;
    });

    return Object.values(map).map((m) => ({
      ...m,
      percentage:
        m.total === 0 ? 0 : Math.round((m.present / m.total) * 100),
    }));
  }, [monthlyList]);

  // ================= KPI =================
  const totalStudents = students.length;

  const totalPresent = attendanceList.filter(
    (a) => a.status?.toLowerCase() === "present"
  ).length;

  const totalAbsent = attendanceList.length - totalPresent;

  const avgAttendance =
    attendanceList.length === 0
      ? 0
      : Math.round((totalPresent / attendanceList.length) * 100);

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <Card style={cardStyle}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                Attendance Panel
              </Title>
              <Text type="secondary">
                Attendance analytics, department overview & logs
              </Text>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space
              align="center"
              size="middle"
              style={{ width: "100%", justifyContent: "flex-end" }}
              wrap
            >
              <Search
                placeholder="Search name or email"
                allowClear
                style={{ width: 220 }}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select value={view} onChange={setView} style={{ width: 200 }}>
                <Select.Option value="ALL">ALL Departments</Select.Option>
                {departments.map((d) => (
                  <Select.Option key={d} value={d}>
                    {d}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI */}
      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle}>
            <Title level={5}>Total Students</Title>
            <Title level={2}>{totalStudents}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle}>
            <Title level={5}>Present</Title>
            <Title level={2} style={{ color: "#52c41a" }}>
              {totalPresent}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle}>
            <Title level={5}>Absent</Title>
            <Title level={2} style={{ color: "#ff4d4f" }}>
              {totalAbsent}
            </Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={cardStyle}>
            <Title level={5}>Avg Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {avgAttendance}%
            </Title>
          </Card>
        </Col>
      </Row>

      {/* DEPARTMENT TABLE */}
      <Card title="Department-wise Attendance" style={{ marginTop: 16 }}>
        <Table
          dataSource={departmentData}
          pagination={false}
          bordered
          columns={[
            {
              title: "Department",
              dataIndex: "department",
              render: (t) => <Tag color="blue">{t}</Tag>,
            },
            {
              title: "Attendance",
              dataIndex: "avgAttendance",
              render: (v) => <Progress percent={v} size="small" />,
            },
            { title: "Present", dataIndex: "present" },
            { title: "Absent", dataIndex: "absent" },
          ]}
        />
      </Card>

      {/* LOGS */}
      <Card title="Attendance Logs (Marked by Staff)" style={{ marginTop: 16 }}>
        <Table
          dataSource={filteredLogs}
          pagination={{ pageSize: 8 }}
          bordered
          columns={[
            { title: "Student", dataIndex: "studentName" },
            { title: "Email", dataIndex: "studentEmail" },
            {
              title: "Dept",
              dataIndex: "studentDept",
              render: (t) => <Tag color="blue">{t}</Tag>,
            },
            {
              title: "Subject",
              dataIndex: "subject",
              render: (t) => <Tag color="purple">{t}</Tag>,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (v) => (
                <Tag color={v?.toLowerCase() === "present" ? "green" : "red"}>
                  {v}
                </Tag>
              ),
            },
            {
              title: "Marked By",
              dataIndex: "staffName",
              render: (t) => <Tag color="orange">{t}</Tag>,
            },
            { title: "Date", dataIndex: "date" },
          ]}
        />
      </Card>

      {/* MONTHLY SUMMARY (NEW) */}
      <Card title="Monthly Summary" style={{ marginTop: 16 }}>
        <Table
          dataSource={monthlySummary}
          loading={monthlyLoading}
          pagination={{ pageSize: 6 }}
          bordered
          columns={[
            {
              title: "Subject / Dept",
              dataIndex: "subject",
              render: (t, r) => (
                <Tag color="purple">{r.subject || r.department}</Tag>
              ),
            },
            { title: "Total", dataIndex: "total" },
            { title: "Present", dataIndex: "present" },
            {
              title: "Percentage",
              dataIndex: "percentage",
              render: (v) => (
                <Progress
                  percent={v}
                  size="small"
                  status={v < 75 ? "exception" : "active"}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AttendanceSuperAdmin;