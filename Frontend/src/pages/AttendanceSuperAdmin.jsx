import React, { useMemo, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Select,
  Tabs,
  Row,
  Col,
  Spin,
} from "antd";

import {
  useGetAllAttendanceQuery,
} from "../redux/attendanceApi";

import {
  useGetUsersQuery,
  useCheckAuthQuery,
} from "../redux/userApi";

const { Title } = Typography;

const AttendanceSuperAdmin = () => {

  /* ================= AUTH (optional) ================= */
  const { data: authData } = useCheckAuthQuery();
  const superAdmin = authData?.user;

  /* ================= USERS (for department mapping) ================= */
  const { data: usersData } = useGetUsersQuery();

  const departments = useMemo(() => {
    if (!usersData?.users) return ["ALL"];
    const deptSet = new Set(
      usersData.users.map((u) => u.department)
    );
    return ["ALL", ...Array.from(deptSet)];
  }, [usersData]);

  /* ================= ATTENDANCE DATA ================= */
  const {
    data: attendanceRes,
    isLoading,
  } = useGetAllAttendanceQuery();

  const allAttendance = attendanceRes?.attendance || [];

  /* ================= STATE ================= */
  const [selectedDept, setSelectedDept] = useState("ALL");

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    if (selectedDept === "ALL") return allAttendance;

    return allAttendance.filter(
      (item) => item.department === selectedDept
    );
  }, [allAttendance, selectedDept]);

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Student",
      dataIndex: ["student", "name"],
    },
    {
      title: "Department",
      dataIndex: "department",
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
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
        department: selectedDept,
        total,
        present,
        absent,
        percentage: `${percentage}%`,
      },
    ];
  }, [filteredData, selectedDept]);

  const summaryColumns = [
    { title: "Department", dataIndex: "department" },
    { title: "Total", dataIndex: "total" },
    { title: "Present", dataIndex: "present" },
    { title: "Absent", dataIndex: "absent" },
    { title: "Attendance %", dataIndex: "percentage" },
  ];

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <Title level={3}>👑 Super Admin Attendance Dashboard</Title>

      {/* ================= FILTER ================= */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ fontWeight: 500 }}>Filter Department</div>

            <Select
              value={selectedDept}
              onChange={setSelectedDept}
              style={{ width: 220, marginTop: 6 }}
            >
              {departments.map((d) => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Tag color="purple" style={{ padding: "5px 10px" }}>
              {selectedDept === "ALL"
                ? "All Departments"
                : `Department: ${selectedDept}`}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* ================= TABS ================= */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "All Attendance",
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Table
                  rowKey="_id"
                  dataSource={filteredData}
                  columns={columns}
                  pagination={{ pageSize: 6 }}
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
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card>
                      Total: {filteredData.length}
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card>
                      Present:{" "}
                      {filteredData.filter((d) => d.status === "Present").length}
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card>
                      Absent:{" "}
                      {filteredData.filter((d) => d.status === "Absent").length}
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AttendanceSuperAdmin;