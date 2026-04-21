import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Card,
  message,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";

import { useSelector, useDispatch } from "react-redux";
import { setPendingStudents } from "../redux/projectSlice";
import { toast } from "react-hot-toast"

import {
  useGetStaffProjectsQuery,
  useAnnounceProjectMutation,
  useStaffReminderMutation,
  useGetPendingStudentsQuery,
} from "../redux/projectApi";
import { useTheme } from "../context/ThemeContext";

import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const AssignmentCheck = () => {

  const { theme, toggleTheme } = useTheme();

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user?._id;
  const staffSubjects = Array.isArray(user.subjects) ? user.subjects : [];

  const [loadingReminder, setLoadingReminder] = useState(false);
  const [announcing, setAnnouncing] = useState(false);



  const { data: allProjectsData } = useGetStaffProjectsQuery();

  const { data: pendingStudentsData } = useGetPendingStudentsQuery();

  const [announceProject] = useAnnounceProjectMutation();
  const [sendStaffReminder] = useStaffReminderMutation();

  const reduxNotifications = useSelector(
    (state) => state.notification.notifications
  );


  useEffect(() => {
    dispatch(
      setPendingStudents(pendingStudentsData?.pendingStudents || [])
    );
  }, [pendingStudentsData, dispatch]);

  const pendingStudents =
    useSelector((state) => state.project.pendingStudents) || [];

  //submit project
  const submittedProjects = useMemo(() => {
    if (!allProjectsData?.projects) return [];

    return allProjectsData.projects
      .filter(
        (p) =>
          staffSubjects.includes(p.subject) &&
          p.status === "submitted"
      )
      .map((p) => ({
        key: p._id,
        studentName: p.student?.name || "Unknown",
        projectName: p.projectName,
        subject: p.subject,
        projectFile: p.projectFile,
        status: p.status,
        isNew: reduxNotifications.some(
          (n) =>
            n.project?.toString() === p._id?.toString() &&
            !n.isRead
        ),
      }));
  }, [allProjectsData, staffSubjects, reduxNotifications]);


  //announce project

  const handleAnnounceProject = async (values) => {
    console.log(values, "values");
    try {
      setAnnouncing(true);

      await announceProject({
        ...values,
        deadline: dayjs(values.deadline).toISOString(),
      }).unwrap();
      console.log(announceProject);

      toast.success("Project announced successfully !");

      form.resetFields();
    } catch (err) {
      toast.error(err?.data?.message || "Announcement failed");
    } finally {
      setAnnouncing(false);
    }
  };

  //sendreminder
  const handleSendReminder = async () => {
    if (!pendingStudents.length)
      return message.info("No pending students");

    try {
      setLoadingReminder(true);

      const reminders = staffSubjects
        .map((subject) => {
          const students = pendingStudents.filter((s) =>
            s.subjects.includes(subject)
          );

          return {
            subject,
            pendingStudentIds: students.map((s) => s._id),
          };
        })
        .filter((r) => r.pendingStudentIds.length);

      for (const reminder of reminders) {
        await sendStaffReminder(reminder).unwrap();
      }

      toast.success("Reminders sent successfully ");
    } catch (err) {
      toast.error(err?.data?.message || "Reminder failed");
    } finally {
      setLoadingReminder(false);
    }
  };



  if (!userId) {
    return (
      <Card style={{ textAlign: "center", color: "red" }}>
        User not logged in!
      </Card>
    );
  }


  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{
        textAlign: "center",
        color: theme === "dark" ? "#fff" : "#000"
      }}>
        Assignment Submission – {staffSubjects.join(", ")}
      </Title>

      {/* ANNOUNCE PROJECT */}
      {user?.role === "staff" &&
        <Card
          className={theme === "dark" ? "dark-card" : ""}
          style={{ marginBottom: 24 }}>
          <Title level={4}
            style={{ color: theme === "dark" ? "#fff" : "#000" }}
          >Announce New Project</Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAnnounceProject}
            style={{ width: "45%" }}
            className={theme === "dark" ? "dark-form" : ""}
          >
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true }]}
            >

              <Select
                placeholder="Select subject"
                style={{ background: theme === "dark" ? "#2a2a2a " : "#fff", borderColor: theme === "dark" ? "#444 " : "#ccc", color: theme === 'dark' ? "#fff" : "#000" }}
                className={theme === "dark" ? "dark-select" : "light-select"}
                popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              >
                {staffSubjects.map((s) => (
                  <Select.Option key={s} value={s}>
                    {s}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>




     <Form.Item
  name="projectName"
  label="Project Name"
  normalize={(value) => value?.trimStart()}
  rules={[{ required: true }]}
>
  <Input
    placeholder="Enter project name"
    style={{
      color: theme === "dark" ? "#fff" : "#000",
      background: theme === "dark" ? "#1f1f1f" : "#fff",
      borderColor: theme === "dark" ? "red" : "#d9d9d9",
    }}
  />
</Form.Item>

            <Form.Item
              name="deadline"
              label="Deadline"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%", background: theme === "dark" ? "#2a2a2a" : "#fff", color: theme === "dark" ? "#fff" : "#000",borderColor: theme === "dark" ? "#444 " : "#ccc" }} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={announcing}>
              Announce Project
            </Button>
          </Form>
        </Card>}

      {/* SUBMITTED PROJECTS */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        style={{ marginBottom: 24 }}>
        <Title level={4}
          style={{ color: theme === "dark" ? "#fff" : "#000" }}

        >Submitted Projects</Title>

        <Table
          className={theme === "dark" ? "dark-table" : ""}
          scroll={{ x: 300 }}
          dataSource={submittedProjects}
          rowKey="key"
          columns={[
            { title: "Student", dataIndex: "studentName" },

            {
              title: "Project",
              dataIndex: "projectName",
              render: (text, record) => (
                <>
                  {text} {record.isNew && <Tag color="green">New</Tag>}
                </>
              ),
            },

            { title: "Subject", dataIndex: "subject" },

            {
              title: "Project File",
              dataIndex: "projectFile",
              render: (file) =>
                file ? (
                  <Button type="link" onClick={() => window.open(file, "_blank")}>
                    View File
                  </Button>
                ) : (
                  <span style={{ color: "red" }}>Not Submitted</span>
                ),
            },

            {
              title: "Status",
              dataIndex: "status",
              render: (status) => (
                <Tag color={status === "submitted" ? "blue" : "orange"}>
                  {status}
                </Tag>
              ),
            },
          ]}
        />
      </Card>

      {/* REMINDER */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        style={{ textAlign: "center" }}>
        <Paragraph
          style={{ color: theme === "dark" ? "#fff" : "#000" }}

        >
          Send reminders to students who have not submitted.
        </Paragraph>

        <Button
          type="primary"
          loading={loadingReminder}
          disabled={!pendingStudents.length}
          onClick={handleSendReminder}
        >
          Send Reminder
        </Button>
      </Card>
    </div>
  );
};

export default AssignmentCheck;