import React, { useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Tabs,
  Row,
  Col,
  Divider,
  Spin,
} from "antd";

import {
  useGetAllAttendanceQuery,
} from "../redux/attendanceApi";

import {
  useCheckAuthQuery,
} from "../redux/userApi";

const { Title } = Typography;

const AttendanceAdmin = () => {

  /* ================= CURRENT USER ================= */
  const { data: authData, isLoading: authLoading } =
    useCheckAuthQuery();

  const admin = authData?.user;
  const adminDepartment = admin?.department;

  /* ================= ALL ATTENDANCE ================= */
  const {
    data: attendanceRes,
    isLoading: attendanceLoading,
  } = useGetAllAttendanceQuery();

  /* ================= FILTER BY DEPARTMENT ================= */
  const filteredData = useMemo(() => {
    const data = attendanceRes?.attendance || [];

    return data.filter(
      (item) => item.department === adminDepartment
    );
  }, [attendanceRes, adminDepartment]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    { title: "Student", dataIndex: ["student", "name"] },
    { title: "Department", dataIndex: "department" },
    { title: "Date", dataIndex: "date" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "Present" ? (
          <Tag color="green">Present</Tag>
        ) : (
          <Tag color="red">Absent</Tag>
        ),
    },
  ];

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter((a) => a.status === "Present").length;
    const absent = filteredData.filter((a) => a.status === "Absent").length;
    const percentage = total ? ((present / total) * 100).toFixed(2) : 0;

    return [
      {
        key: 1,
        department: adminDepartment,
        total,
        present,
        absent,
        percentage: `${percentage}%`,
      },
    ];
  }, [filteredData, adminDepartment]);

  const summaryColumns = [
    { title: "Department", dataIndex: "department" },
    { title: "Total Records", dataIndex: "total" },
    { title: "Present", dataIndex: "present" },
    { title: "Absent", dataIndex: "absent" },
    { title: "Attendance %", dataIndex: "percentage" },
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <Title level={3}>🏛️ HOD Attendance Dashboard</Title>

      {/* ================= HEADER ================= */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row justify="space-between">
          <Col>
            <div style={{ fontWeight: 500 }}>Department Access</div>
            <Tag color="blue" style={{ marginTop: 6 }}>
              {adminDepartment} Department
            </Tag>
          </Col>

          <Col>
            <div style={{ color: "gray" }}>
              🔐 Auto-filtered from login
            </div>
          </Col>
        </Row>
      </Card>

      {/* ================= TABS ================= */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Attendance Records",
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Table
                  rowKey="_id"
                  dataSource={filteredData}
                  columns={columns}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            ),
          },

          {
            key: "2",
            label: "Monthly Summary",
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Table
                  dataSource={summary}
                  columns={summaryColumns}
                  pagination={false}
                />
              </Card>
            ),
          },

          {
            key: "3",
            label: "Insight",
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Divider>Quick Stats</Divider>

                <p>📊 Total Records: {filteredData.length}</p>
                <p>
                  🟢 Present:{" "}
                  {filteredData.filter((d) => d.status === "Present").length}
                </p>
                <p>
                  🔴 Absent:{" "}
                  {filteredData.filter((d) => d.status === "Absent").length}
                </p>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AttendanceAdmin;