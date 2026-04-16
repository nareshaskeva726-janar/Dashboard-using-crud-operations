import React, { useState } from "react";
import { Table, Typography, Card, Select } from "antd";
import Text from "antd/es/typography/Text";

const { Title } = Typography;
const { Option } = Select;

const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "ML"],
  CSE: ["C Basics", "DSA", "Algorithms", "DBMS", "OS"],
  MECH: ["Thermodynamics", "CAD", "Robotics", "Strength of Materials", "Fluid Mechanics"],
  CIVIL: ["Surveying", "Structural Analysis", "Concrete Tech", "Geo Tech", "Hydraulics"],
};

const AttendanceStudent = () => {
  const [department, setDepartment] = useState("CSE");

  const subjects = departmentSubjectsMap[department];

  // 👉 Monthly Summary (dynamic)
  const monthlyData = subjects.map((sub, index) => ({
    key: index,
    month: "April",
    subject: sub,
    totalClasses: 40,
    attended: Math.floor(Math.random() * 40),
    percentage: `${Math.floor(Math.random() * 100)}%`,
  }));

  const monthlyColumns = [
    { title: "Month", dataIndex: "month" },
    { title: "Subject", dataIndex: "subject" },
    { title: "Total Classes", dataIndex: "totalClasses" },
    { title: "Attended", dataIndex: "attended" },
    {
      title: "Attendance %",
      dataIndex: "percentage",
      render: (text) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {text}
        </span>
      ),
    },
  ];

  // 👉 Daily Attendance (demo)
  const attendanceData = subjects.map((sub, index) => ({
    key: index,
    date: "2026-04-16",
    subject: sub,
    status: Math.random() > 0.3 ? "Present" : "Absent",
  }));

  const attendanceColumns = [
    { title: "Date", dataIndex: "date" },
    { title: "Subject", dataIndex: "subject" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <span
          style={{
            color: status === "Present" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>My Attendance</Title>

      {/* Department Selector */}
      <Card style={{ marginBottom: 20 }}>
        <Text style={{fontWeight: ""}}>Department</Text>
        <Select
          value={department}
          onChange={(value) => setDepartment(value)}
          style={{ width: 200 }}
        >
          {Object.keys(departmentSubjectsMap).map((dept) => (
            <Option key={dept} value={dept}>
              {dept}
            </Option>
          ))}
        </Select>
      </Card>

      {/* Monthly Summary */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={5}>Monthly Summary</Title>
        <Table dataSource={monthlyData} columns={monthlyColumns} pagination={false} />
      </Card>

      {/* Attendance Details */}
      <Card>
        <Title level={5}>Attendance Details</Title>
        <Table dataSource={attendanceData} columns={attendanceColumns} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default AttendanceStudent;