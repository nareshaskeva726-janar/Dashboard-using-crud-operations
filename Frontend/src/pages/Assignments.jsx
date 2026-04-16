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
  Input
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {toast} from "react-hot-toast";

import {
  useSubmitProjectMutation,
  useGetMyProjectsQuery,
} from "../redux/projectApi";

import { useGetNotificationsQuery } from "../redux/notificationApi";

import socket from "../socket/socket";

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
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const subjectsList = departmentSubjectsMap[user?.department] || [];

  const { data, refetch } = useGetMyProjectsQuery();
  const projects = data?.projects || [];

  const { data: notificationData, refetch: refetchAnnouncements } = useGetNotificationsQuery();
  const announcedProjects =
    notificationData?.notifications?.filter(n => n.type === "PROJECT_ANNOUNCEMENT") || [];
    console.log(announcedProjects, "data");

  const [submitProject, { isLoading }] = useSubmitProjectMutation();

  useEffect(() => {
    socket.on("projectAnnounced", () => {
      refetchAnnouncements();
      toast.info(" New project announced!");
    });

    socket.on("marksUpdated", () => {
      refetch();
      toast.success("Marks updated!");
    });

    return () => {
      socket.off("projectAnnounced");
      socket.off("marksUpdated");
    };
  }, [refetch, refetchAnnouncements]);

  const onFinish = async (values) => {
    try {
      const fileObj = values.file?.[0]?.originFileObj;
      if (!fileObj) return message.error("Upload project file");

      const formData = new FormData();
      formData.append("projectName", values.projectName || fileObj.name);
      formData.append("subject", values.subject);
      formData.append("email", values.email);
      formData.append("projectFile", fileObj);

      await submitProject(formData).unwrap();

      toast.success(" Project submitted successfully");
      refetch();
      form.resetFields();
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Submission failed");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* ===== SUBMIT BUTTON ===== */}
      <Card
        style={{
          textAlign: "center",
          marginBottom: 30,
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3}>Submit Your Assignment</Title>
        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Submit Project
        </Button>
      </Card>

      {/* ===== MODAL ===== */}
      <Modal
        title={<Title level={4}>Submit Project</Title>}
        open={open}
        footer={null}
        destroyOnClose
        onCancel={() => setOpen(false)}
        bodyStyle={{ padding: 24 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Select subject" }]}
          >
            <Select placeholder="Select subject" size="large">
              {subjectsList.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[{ required: true, type: "text", message: "Enter valid email" }]}
          >
            <Input placeholder="projectName" />
          </Form.Item>

          <Form.Item
            name="file"
            label="Project File"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Upload file" }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />} type="dashed" block>
                Upload File
              </Button>
            </Upload>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ borderRadius: 8 }}
          >
            Submit
          </Button>
        </Form>
      </Modal>

      {/* ===== SUBMITTED PROJECTS ===== */}
      <Card
        title={<Title level={4}>My Submitted Projects</Title>}
        style={{ borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
      >
        <Row gutter={[20, 20]}>
          {projects.length ? (
            projects.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s",
                  }}
                  bodyStyle={{ padding: 16 }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Text strong>Subject:</Text> {p.subject || "-"} <br />
                  <Text strong>Project:</Text> {p.projectName || "-"} <br />

                  <Tag color={p.status === "Submitted" ? "green" : "orange"} style={{ marginTop: 8 }}>
                    {p.status || "Pending"}
                  </Tag>
                  <br />

                  {p.projectFile && (
                    <a
                      href={p.projectFile}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block", marginTop: 8 }}
                    >
                      View File
                    </a>
                  )}

                  {p.marks !== undefined && (
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      Marks: {p.marks}
                    </Tag>
                  )}
                </Card>
              </Col>
            ))
          ) : (
            <p>No submissions yet</p>
          )}
        </Row>
      </Card>
    </div>
  );
};




export default Assignments;