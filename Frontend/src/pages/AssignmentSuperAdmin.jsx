import React, { useState, useMemo } from "react";
import {
  Table,
  Select,
  Spin,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Empty,
} from "antd";
import { useGetAllProjectsSuperadminQuery } from "../redux/projectApi";

const { Option } = Select;
const { Title, Text } = Typography;
import { useTheme } from "../context/ThemeContext";

const AssignmentSuperAdmin = () => {

  const { theme, toggleTheme } = useTheme();





  const { data, isLoading } = useGetAllProjectsSuperadminQuery();

  const projects = Array.isArray(data?.data) ? data.data : [];
  const [departmentFilter, setDepartmentFilter] = useState("");

  /* ================= DEPARTMENTS ================= */
  const departments = useMemo(() => {
    return [...new Set(projects.map((p) => p.department))];
  }, [projects]);

  /* ================= FILTER ================= */
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const filePath = p.projectFile?.path || p.projectFile;
      const isSubmitted = p.student && filePath;

      const matchesDepartment =
        !departmentFilter || p.department === departmentFilter;

      return isSubmitted && matchesDepartment;
    });
  }, [projects, departmentFilter]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = projects.length;

    const submitted = projects.filter((p) => {
      const filePath = p.projectFile?.path || p.projectFile;
      return p.student && filePath;
    }).length;

    const pending = total - submitted;

    return { total, submitted, pending };
  }, [projects]);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Student",
      render: (_, record) => record.student?.name || "-",
    },
    {
      title: "Project",
      dataIndex: "projectName",
    },
    {
      title: "Department",
      dataIndex: "department",
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "File",
      render: (_, record) => {
        const filePath =
          record.projectFile?.path || record.projectFile;

        if (!filePath) {
          return <Tag color="red">Not Uploaded</Tag>;
        }

        return (
          <a href={filePath} target="_blank" rel="noreferrer">
            View File
          </a>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleString("en-IN") : "-",
    },
  ];

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }





  return (
    <div style={{
      padding: 16, minHeight: "100vh",

      background: theme === "dark" ? "#1f1f1f" : "#fff"

    }}>
      {/* HEADER */}
      <Title level={3} style={{ marginBottom: 4, color: theme === "dark" ? "#fff" : "#000" }}>
        Project Submissions
      </Title>
      <Text type="secondary" style={{ color: theme === "dark" ? "#fff" : "#000" }}>
        Super Admin dashboard for all student projects
      </Text>

      {/* ================= STATS CARDS ================= */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Total Projects</Title>
            <Title level={2} style={{ color: theme === "dark" ? "lightblue" : "darkblue" }}>{stats.total}</Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Submitted</Title>
            <Title level={2} style={{ color: "green" }}>
              {stats.submitted}
            </Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>
            <Title level={5} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Pending</Title>
            <Title level={2} style={{ color: "red" }}>
              {stats.pending}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* ================= FILTER ================= */}
      <Card style={{ marginTop: 16, marginBottom: 16, background: theme === "dark" ? "#1f1f1f" : "#fff" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong style={{ color: theme === "dark" ? "#fff" : "#000" }}>Filter by Department</Text>
          </Col>

          <Col>
            <Select
              placeholder="Select Department"
              allowClear
              style={{background: theme === "dark" ? "#141414" : "#fff", color: theme === "dark" ? "#bbb" : "#000", borderColor: theme === "dark" ? "#333" : "#d9d9d9", width: 220 }}
              className={theme === "dark" ? "dark-select" : ""}
              popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              onChange={(value) => setDepartmentFilter(value)}
            >
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ================= TABLE ================= */}
      <Card style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}>
        {filteredProjects.length ? (
          <Table
            className={theme === "dark" ? "dark-table" : ""}
            columns={columns}
            dataSource={filteredProjects}
            rowKey={(record) => record._id}
            bordered
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty description="No projects found" style={{ color: theme === "dark" ? "#fff" : "#000" }} />
        )}
      </Card>
    </div>
  );
};

export default AssignmentSuperAdmin;