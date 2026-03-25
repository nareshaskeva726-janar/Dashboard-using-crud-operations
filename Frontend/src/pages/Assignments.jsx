import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  useSubmitProjectMutation,
  useGetMyProjectsQuery,
} from "../redux/projectApi";
import { useGetNotificationsQuery } from "../redux/notificationApi";
import socket from "../socket/socket.js";
import {
  setNotifications,
  addNotification,
  mergeNotifications,
} from "../redux/notificationSlice.js";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

const subjectsList = ["Java", "C", "C++", "Python", "DataScience"];

const Assignments = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const dispatch = useDispatch();

  const [submitProject, { isLoading }] = useSubmitProjectMutation();

  const { data, refetch } = useGetMyProjectsQuery();

  const projects = data?.projects || [];

  // ✅ Fetch notifications (API)
  const { data: notifData } = useGetNotificationsQuery(undefined, {
    skip: !userId,
  });

  // ✅ Redux notifications
  const { notifications } = useSelector((state) => state.notification);

  // ✅ Sync API → Redux
  useEffect(() => {
    if (notifData?.notifications) {
      dispatch(setNotifications(notifData.notifications));
    }
  }, [notifData, dispatch]);

  // 🔥 SOCKET (FIXED - NO REFRESH POPUP)
  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", userId);

    let isFirstLoad = true; // ✅ BLOCK refresh popup
    const shownNotifications = new Set();

    const handleNotification = (notif) => {
      if (notif.receiverRole !== "student") return;

      //  skip refresh notifications
      if (isFirstLoad) return;

      //  prevent duplicates
      if (shownNotifications.has(notif._id)) return;
      shownNotifications.add(notif._id);

      dispatch(addNotification(notif));

      //  only real-time notification
      message.info(notif.message);
    };

    const handleOfflineNotifications = (notifs) => {
      if (!Array.isArray(notifs)) return;

      dispatch(mergeNotifications(notifs));

      //  after refresh allow new notifications
      isFirstLoad = false;
    };

    socket.on("newNotification", handleNotification);
    socket.on("loadUnreadNotifications", handleOfflineNotifications);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("loadUnreadNotifications", handleOfflineNotifications);
    };
  }, [userId, dispatch]);

  // SUBMIT PROJECT
  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("subject", values.subject);
      formData.append("projectName", values.projectName);

      const fileObj = values.file?.[0]?.originFileObj;
      if (!fileObj) {
        return message.error("Please upload a file");
      }

      formData.append("projectFile", fileObj);

      await submitProject(formData).unwrap();

      message.success("Project submitted successfully ");

      refetch();
      form.resetFields();
      setOpen(false);
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Submission failed");
    }
  };



  return (
    <div style={{ padding: "20px" }}>
      <Card style={{ textAlign: "center", marginBottom: 20 }}>
        <h1>Submit Your Project</h1>
        <Button type="primary" onClick={() => setOpen(true)}>
          Add Project
        </Button>
      </Card>

      <Modal
        title="Submit Your Project"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Select a subject" }]}
          >
            <Select placeholder="Select Subject">
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
            normalize={(value) => value?.trimStart()}
            rules={[{ required: true, message: "Enter project name" }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            label="Project File"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={[{ required: true, message: "Upload your project file" }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>
                Upload Project File
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Submit
              </Button>
              <Button danger onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Card title="Completed Projects">

        
        <Row gutter={[16, 16]}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <Col xs={24} sm={12} md={8} lg={6} key={project._id}>
                <Card bordered hoverable>
                  <p>
                    <strong>Subject:</strong> {project.subject}
                  </p>
                  <p>
                    <strong>Project Name:</strong> {project.projectName}
                  </p>
                  {project.projectFile ? (
                    <a href={project.projectFile} target="_blank">
                      View File
                    </a>
                  ) : (
                    <span style={{ color: "red" }}>Not Submitted</span>
                  )}
                </Card>
              </Col>
            ))
          ) : (
            <p style={{ textAlign: "center", width: "100%" }}>
              No projects submitted yet.
            </p>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default Assignments;


