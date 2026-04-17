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

const AssignmentSuperAdmin = () => {
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
    <div style={{ padding: 16, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <Title level={3} style={{ marginBottom: 4 }}>
        Project Submissions
      </Title>
      <Text type="secondary">
        Super Admin dashboard for all student projects
      </Text>

      {/* ================= STATS CARDS ================= */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Total Projects</Title>
            <Title level={2}>{stats.total}</Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Submitted</Title>
            <Title level={2} style={{ color: "green" }}>
              {stats.submitted}
            </Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Pending</Title>
            <Title level={2} style={{ color: "red" }}>
              {stats.pending}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* ================= FILTER ================= */}
      <Card style={{ marginTop: 16, marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>Filter by Department</Text>
          </Col>

          <Col>
            <Select
              placeholder="Select Department"
              allowClear
              style={{ width: 220 }}
              onChange={(value) => setDepartmentFilter(value)}
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ================= TABLE ================= */}
      <Card>
        {filteredProjects.length ? (
          <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey={(record) => record._id}
            bordered
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty description="No projects found" />
        )}
      </Card>
    </div>
  );
};

export default AssignmentSuperAdmin;