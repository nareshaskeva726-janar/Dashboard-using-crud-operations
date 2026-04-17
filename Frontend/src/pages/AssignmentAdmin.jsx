import React, { useMemo } from "react";
import { Table, Spin, Tag, Card, Row, Col, Typography, Empty } from "antd";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import { useGetAllProjectsSuperadminQuery } from "../redux/projectApi";

const { Title, Text } = Typography;

const AssignmentAdmin = () => {
  const { data, isLoading } = useGetAllProjectsSuperadminQuery();
  const user = useSelector(selectUser);

  const projects = Array.isArray(data?.data) ? data.data : [];

  /* ================= FILTER ================= */
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const filePath = p.projectFile?.path || p.projectFile;
      const hasFile = Boolean(filePath);

      return (
        p.department === user?.department &&
        hasFile
      );
    });
  }, [projects, user]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = projects.filter(
      (p) => p.department === user?.department
    ).length;

    const submitted = filteredProjects.length;

    const pending = total - submitted;

    return { total, submitted, pending };
  }, [projects, filteredProjects, user]);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Student",
      render: (_, record) =>
        record.student?.name || "Not Submitted",
    },
    {
      title: "Project",
      dataIndex: "projectName",
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Department",
      dataIndex: "department",
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "File",
      render: (_, record) => {
        const filePath =
          typeof record.projectFile === "string"
            ? record.projectFile
            : record.projectFile?.path;

        if (!filePath) {
          return <Tag color="red">No File</Tag>;
        }

        return (
          <a href={filePath} target="_blank" rel="noreferrer">
            View File
          </a>
        );
      },
    },
    {
      title: "Created At",
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
        {user?.department} Department Projects
      </Title>

      <Text type="secondary">
        Manage and view submitted student assignments
      </Text>

      {/* ================= STATS ================= */}
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

      {/* ================= TABLE ================= */}
      <Card style={{ marginTop: 16 }}>
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
          <Empty description="No projects found for your department" />
        )}
      </Card>
    </div>
  );
};

export default AssignmentAdmin;