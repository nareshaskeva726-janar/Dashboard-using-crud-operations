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
  Space
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
      <Space
        direction="vertical"
        size={2}
        style={{ marginBottom: 16 }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            fontWeight: 600,
            color: theme === "dark" ? "#fff" : "#111",
          }}
        >
          Project Submissions
        </Title>

        <Text
          style={{
            fontSize: 14,
            color: theme === "dark" ? "#a6a6a6" : "#666",
          }}
        >
          Super Admin dashboard for all student projects
        </Text>
      </Space>

      {/* ================= STATS CARDS ================= */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              borderRadius: 12,
              border:
                theme === "dark"
                  ? "1px solid #303030"
                  : "1px solid #f0f0f0",
              transition: "all 0.25s ease",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Space
              direction="vertical"
              size={4}
              style={{ width: "100%" }}
            >
              {/* LABEL */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme === "dark" ? "#a6a6a6" : "#666",
                }}
              >
                Total Projects
              </Text>

              {/* VALUE */}
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: theme === "dark" ? "#69c0ff" : "#1677ff",
                }}
              >
                {stats.total}
              </Title>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              borderRadius: 12,
              border:
                theme === "dark"
                  ? "1px solid #303030"
                  : "1px solid #f0f0f0",
              transition: "all 0.25s ease",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Space
              direction="vertical"
              size={4}
              style={{ width: "100%" }}
            >
              {/* LABEL */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme === "dark" ? "#a6a6a6" : "#666",
                }}
              >
                Submitted
              </Text>

              {/* VALUE */}
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: "#52c41a",
                }}
              >
                {stats.submitted}
              </Title>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              borderRadius: 12,
              border:
                theme === "dark"
                  ? "1px solid #303030"
                  : "1px solid #f0f0f0",
              transition: "all 0.25s ease",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Space
              direction="vertical"
              size={4}
              style={{ width: "100%" }}
            >
              {/* LABEL */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme === "dark" ? "#a6a6a6" : "#666",
                }}
              >
                Pending
              </Text>

              {/* VALUE */}
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  color: "#ff4d4f",
                }}
              >
                {stats.pending}
              </Title>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ================= FILTER ================= */}
      <Card
        style={{
          marginTop: 16,
          marginBottom: 20,
          borderRadius: 12,
          background: theme === "dark" ? "#1f1f1f" : "#fff",
          border:
            theme === "dark"
              ? "1px solid #303030"
              : "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: "18px 22px" }}
      >
        <Row justify="space-between" align="middle">

          {/* LEFT SIDE */}
          <Col>
            <Space direction="vertical" size={0}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: theme === "dark" ? "#fff" : "#111",
                }}
              >
                Filter Projects
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: theme === "dark" ? "#a6a6a6" : "#888",
                }}
              >
                Select department to refine results
              </Text>
            </Space>
          </Col>

          {/* RIGHT SIDE */}
          <Col>
            <Select
              placeholder="Select Department"
              allowClear
              size="large"
              style={{
                borderRadius: "10px",
                background: theme === "dark" ? "#1f1f1f" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
                width: 240
              }}


              className={theme === "dark" ? "dark-select" : ""}


              popupClassName={
                theme === "dark" ? "dark-select-dropdown" : ""
              }


              onChange={(value) => setDepartmentFilter(value)}
            >
              {departments.map((dept) => (
                <Select.Option
                  style={{ color: theme === "dark" ? "#fff" : "#000", background: theme === "dark" ? "#1f1f1f" : "#fff" }}
                  key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>



      {/* ================= TABLE ================= */}
      <Card
        style={{
          borderRadius: 12,
          background: theme === "dark" ? "#1f1f1f" : "#fff",
          border:
            theme === "dark"
              ? "1px solid #303030"
              : "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: 20 }} onChange={(value) => setDepartmentFilter(value)}
        title={
          <Space>
            <Text
              strong
              style={{
                fontSize: 16,
                color: theme === "dark" ? "#fff" : "#111",
              }}
            >
              Project Submissions
            </Text>

            <Tag color="processing">
              {filteredProjects.length} Projects
            </Tag>
          </Space>
        }
      >
        {filteredProjects.length ? (
          <Table
            className={theme === "dark" ? "dark-table" : ""}
            columns={columns}
            dataSource={filteredProjects}
            rowKey={(record) => record._id}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
            }}
            bordered={false}
            size="middle"
            scroll={{ x: "max-content" }}
          />
        ) : (
          <Empty
            description={
              <span style={{ color: theme === "dark" ? "#aaa" : "#666" }}>
                No projects found
              </span>
            }
            style={{ padding: 40 }}
          />
        )}
      </Card>
    </div>
  );
};

export default AssignmentSuperAdmin;