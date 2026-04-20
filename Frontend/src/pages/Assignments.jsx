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
      <Card style={{ ...cardStyle, textAlign: "center", marginBottom: 20 }}>
        <Title level={3} style={{ color: isDark ? "#fff" : "#000" }}>
          Submit Your Assignment
        </Title>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Submit Project
        </Button>
      </Card>

      {/* ===== MODAL ===== */}
      <Modal
        title="Submit Project"
        open={open}
        footer={null}
        destroyOnClose
        onCancel={() => setOpen(false)}
        styles={{
          body: { background: isDark ? "#1f1f1f" : "#fff" },
          header: { background: isDark ? "#1f1f1f" : "#fff" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Select subject" }]}
          >
            <Select placeholder="Select subject">
              {subjectsList.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[{ required: true, message: "Enter project name" }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="file"
            label="Project File"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Upload file" }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />} block>
                Upload File
              </Button>
            </Upload>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Submit
          </Button>
        </Form>
      </Modal>

      {/* ===== PROJECT LIST ===== */}
      <Card
        style={cardStyle}
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
                  }}
                >
                  {/* TOP CONTENT */}
                  <div>
                    <Text strong style={{color: theme === "dark" ? "#fff" : "#000"}}>Subject:</Text> {p.subject || "-"} <br />
                    <Text strong style={{color: theme === "dark" ? "#fff" : "#000"}}>Project:</Text> {p.projectName || "-"} <br />

                    <Tag
                      color={p.status === "Submitted" ? "green" : "orange"}
                      style={{ marginTop: 8 }}
                    >
                      {p.status || "Pending"}
                    </Tag>
                  </div>

                  {/* BOTTOM CONTENT (always aligned) */}
                  <div>
                    {p.projectFile && (
                      <a href={p.projectFile} target="_blank" rel="noreferrer">
                        View File
                      </a>
                    )}

                    {p.marks !== undefined && (
                      <Tag color="blue" style={{ marginTop: 8 }}>
                        Marks: {p.marks}
                      </Tag>
                    )}
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Empty description="No submissions yet" />
          )}
        </Row>
      </Card>

    </div>
  );
};

export default Assignments;