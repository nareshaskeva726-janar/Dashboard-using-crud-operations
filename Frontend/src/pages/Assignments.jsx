import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  Upload,
  Card,
  Row,
  Col,
  message,
  Tag,
  Typography,
  Input,
  Empty,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";

import {
  useSubmitProjectMutation,
  useGetMyProjectsQuery,
} from "../redux/projectApi";

import { useGetNotificationsQuery } from "../redux/notificationApi";

import socket from "../socket/socket";
import { useTheme } from "../context/ThemeContext";

const { Option } = Select;
const { Title, Text } = Typography;

/* ================= SUBJECT MAP ================= */
const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
  CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
  MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
  CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"],
};

const Assignments = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const subjectsList = departmentSubjectsMap[user?.department] || [];

  const { data, refetch } = useGetMyProjectsQuery();
  const projects = data?.projects ?? [];

  const { data: notificationData, refetch: refetchAnnouncements } =
    useGetNotificationsQuery();

  const announcedProjects =
    notificationData?.notifications?.filter(
      (n) => n.type === "PROJECT_ANNOUNCEMENT"
    ) ?? [];

  const [submitProject, { isLoading }] = useSubmitProjectMutation();

  /* ================= SOCKET ================= */
  useEffect(() => {
    const handleAnnounce = () => {
      refetchAnnouncements();
      toast.info("New project announced!");
    };

    const handleMarks = () => {
      refetch();
      toast.success("Marks updated!");
    };

    socket.on("projectAnnounced", handleAnnounce);
    socket.on("marksUpdated", handleMarks);

    return () => {
      socket.off("projectAnnounced", handleAnnounce);
      socket.off("marksUpdated", handleMarks);
    };
  }, [refetch, refetchAnnouncements]);

  /* ================= SUBMIT ================= */
  const onFinish = async (values) => {
    try {
      const fileObj = values.file?.[0]?.originFileObj;

      if (!fileObj) {
        return message.error("Upload project file");
      }

      const formData = new FormData();
      formData.append("projectName", values.projectName);
      formData.append("subject", values.subject);
      formData.append("email", user?.email || "");
      formData.append("projectFile", fileObj);

      await submitProject(formData).unwrap();

      toast.success("Project submitted successfully");
      refetch();
      form.resetFields();
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Submission failed");
    }
  };

  /* ================= THEME STYLE ================= */
  const pageStyle = {
    padding: 24,
    maxWidth: 1200,
    margin: "0 auto",
    background: isDark ? "#141414" : "#fff",
    minHeight: "100vh",
  };

  const cardStyle = {
    background: isDark ? "#1f1f1f" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  return (
    <div style={pageStyle}>

      {/* ===== HEADER ===== */}
      <Card style={{
        ...cardStyle, textAlign: "center", marginBottom: 20,
        border:
          theme === "dark"
            ? "1px solid #2a2a2a"
            : "1px solid #e5e7eb"

      }}>
        <Title level={3} style={{ color: isDark ? "#fff" : "#000" }}>
          Submit Your Assignment
        </Title>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Submit Project
        </Button>
      </Card>

      {/* ===== MODAL ===== */}
      <Modal
        title={
          <span style={{ color: isDark ? "#fff" : "#000" }}>
            Submit Project
          </span>
        }
        open={open}
        footer={null}
        destroyOnClose
        onCancel={() => setOpen(false)}
        className={isDark ? "dark-modal" : ""}
        styles={{
          content: {
            background: isDark ? "#1f1f1f" : "#fff",
            borderRadius: 12,
          },
          header: {
            background: isDark ? "#1f1f1f" : "#fff",
            borderBottom: isDark
              ? "1px solid #303030"
              : "1px solid #f0f0f0",
          },
          body: {
            background: isDark ? "#1f1f1f" : "#fff",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={isDark ? "dark-form" : ""}
        >
          {/* SUBJECT */}
          <Form.Item
            label={<span style={{ color: isDark ? "#fff" : "#000" }}>Subject</span>}
            name="subject"
            rules={[{ required: true, message: "Select subject" }]}
          >
            <Select
              style={{
                background: theme === "dark" ? "#1f1f1f" : "#fff",
                border:
                  theme === "dark"
                    ? "1px solid #2a2a2a"
                    : "1px solid #e5e7eb",

              }}
              placeholder="Select subject"
              className={isDark ? "dark-select" : ""}
              popupClassName={isDark ? "dark-select-dropdown" : ""}
            >
              {subjectsList.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* PROJECT NAME */}
          <Form.Item
            label={<span style={{ color: isDark ? "#fff" : "#000" }}>Project Name</span>}
            name="projectName"
            rules={[{ required: true, message: "Enter project name" }]}
          >
            <Input
              placeholder="Enter project name"
              className={isDark ? "dark-input" : ""}
            />
          </Form.Item>

          {/* FILE UPLOAD */}
          <Form.Item
            name="file"
            label={<span style={{ color: isDark ? "#fff" : "#000" }}>Project File</span>}
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Upload file" }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button
                icon={<UploadOutlined />}
                block
                style={{
                  background: isDark ? "#141414" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  borderColor: isDark ? "#303030" : "#d9d9d9",
                }}
              >
                Upload File
              </Button>
            </Upload>
          </Form.Item>

          {/* SUBMIT */}
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ borderRadius: 8 }}
          >
            Submit Project
          </Button>
        </Form>
      </Modal>





      {/* ===== PROJECT LIST ===== */}
      <Card
        style={{
          background: theme === "dark" ? "#1f1f1f" : "#fff",
          border:
            theme === "dark"
              ? "1px solid #2a2a2a"
              : "1px solid #e5e7eb"
        }}
        title={<span style={{ color: isDark ? "#fff" : "#000" }}>My Submitted Projects</span>}
      >
        <Row gutter={[16, 16]}>
          {projects.length > 0 ? (
            projects.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <Card
                  hoverable
                  style={{
                    ...cardStyle,
                    height: 180,          // ✅ fixed height
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "20px",
                    border:
                      theme === "dark"
                        ? "1px solid #2a2a2a"
                        : "1px solid #e5e7eb"

                  }}
                >
                  {/* TOP CONTENT */}
                  <div>
                    <Text strong style={{ color: theme === "dark" ? "#fff" : "#000" }}>Subject:</Text> {p.subject || "-"} <br />
                    <Text strong style={{ color: theme === "dark" ? "#fff" : "#000" }}>Project:</Text> {p.projectName || "-"} <br />

                    <Tag
                      color={p.status === "Submitted" ? "green" : "orange"}
                      style={{ marginTop: 8 }}
                    >
                      {p.status || "Pending"}
                    </Tag>

                    {p.marks !== undefined && (
                      <Tag color="blue" style={{ marginTop: 8 }}>
                        Marks: {p.marks}
                      </Tag>
                    )}
                  </div>

                  {/* BOTTOM CONTENT (always aligned) */}
                  <div>
                    {p.projectFile && (
                      <a href={p.projectFile} target="_blank" rel="noreferrer">
                        View File
                      </a>
                    )}



                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Card
              style={{
                marginTop: 16,
                textAlign: "center",
                display: "block",
                margin: "auto",
                background: theme === "dark" ? "#1f1f1f" : "#ffffff",
                borderRadius: 16,
                border: theme === "dark" ? "1px solid #333" : "1px solid #f0f0f0",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <h3
                      style={{
                        color: theme === "dark" ? "#fff" : "#000",
                        marginBottom: 6,
                      }}
                    >
                      No submissions yet
                    </h3>

                    <p
                      style={{
                        color: theme === "dark" ? "#aaa" : "#666",
                        fontSize: 14,
                      }}
                    >
                      Students haven't submitted any projects yet.
                    </p>
                  </div>
                }
              />
            </Card>
          )}
        </Row>
      </Card>

    </div>
  );
};

export default Assignments;