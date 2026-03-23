import React, { useEffect, useMemo, useState, useRef } from "react";
import { Table, Button, Typography, Card, message, Tag } from "antd";
import socket from "../socket/socket.js";
import {
  useGetProjectsQuery,
  useGetPendingStudentsQuery,
  useSendReminderMutation,
} from "../redux/projectApi";
import { useDispatch, useSelector } from "react-redux";
import { setPendingStudents } from "../redux/projectSlice";

const { Title, Paragraph } = Typography;

const AssignmentCheck = () => {
  const dispatch = useDispatch();
  const [loadingReminder, setLoadingReminder] = useState(false);







  const { data: allProjectsData, refetch: refetchProjects } = useGetProjectsQuery();

  const { data: pendingData, refetch: refetchPending } = useGetPendingStudentsQuery();



  const [sendReminder] = useSendReminderMutation();

  const [notifications, setNotifications] = useState([]);

  const processedIds = useRef(new Set());

  const isSocketInitialized = useRef(false);


  const refetchProjectsRef = useRef(refetchProjects);
  const refetchPendingRef = useRef(refetchPending);




  useEffect(() => {
    refetchProjectsRef.current = refetchProjects;
    refetchPendingRef.current = refetchPending;
  });




  const user = JSON.parse(localStorage.getItem("user"));
  const staffSubject = user?.department || null;

  console.log(staffSubject);

  const staffId = user?._id;
  console.log(staffId, "test")


  useEffect(() => {
    if (pendingData?.pendingStudents) {
      dispatch(setPendingStudents(pendingData.pendingStudents));
    }
  }, [pendingData, dispatch]);




  const pendingStudents = useSelector((state) => state.project.pendingStudents);


  

  // SOCKET  
  useEffect(() => {
    if (!staffId || isSocketInitialized.current) return;

    isSocketInitialized.current = true; // 🔥 prevent re-run

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", staffId);

    const handleNotification = (notif) => {
      if (notif.receiverRole !== "staff") return;

      if (processedIds.current.has(notif._id)) return;
      processedIds.current.add(notif._id);

      setNotifications((prev) => [notif, ...prev]);

      //  ONLY realtime toast
      message.info(notif.message);

      refetchProjectsRef.current();
      refetchPendingRef.current();
    };




    // FOR OFFLINE USERS
    const handleOfflineNotifications = (notifs) => {
      if (!Array.isArray(notifs)) return;

      const filtered = notifs.filter((n) => n.receiverRole === "staff");

      const newOnes = filtered.filter(
        (n) => !processedIds.current.has(n._id)
      );

      newOnes.forEach((n) => processedIds.current.add(n._id));

      //  NO message here
      if (newOnes.length > 0) {
        setNotifications((prev) => [...newOnes, ...prev]);
      }
    };

    socket.on("newNotification", handleNotification);
    socket.on("loadUnreadNotifications", handleOfflineNotifications);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("loadUnreadNotifications", handleOfflineNotifications);
    };
  }, [staffId]);

  //  PROJECT FILTER


  const submittedProjects = useMemo(() => {


    const projectsArray = allProjectsData?.projects || [];
    if (!staffSubject) return [];


    return projectsArray
      .filter((p) => p.subject === staffSubject)
      .map((p) => ({
        key: p._id,
        studentId: p.student?._id,
        studentName: p.student?.name || "Student",
        projectName: p.projectName,
        subject: p.subject,
        projectFile: p.projectFile || null,
        isNew: notifications.some(
          (n) =>
            n.project?.toString() === p._id.toString() && !n.isRead
        ),
      }));
  }, [allProjectsData, staffSubject, notifications]);

  // ================= SEND REMINDER =================
  const handleSendReminder = async () => {
    try {
      setLoadingReminder(true);

      const submittedStudentIds = submittedProjects.map((p) =>
        p.studentId?.toString()
      );

      const actualPending = pendingStudents.filter(
        (s) => !submittedStudentIds.includes(s._id.toString())
      );

      const pendingIds = actualPending.map((s) => s._id);

      if (pendingIds.length === 0) {
        message.warning("No pending students 🎉");
        return;
      }

      const res = await sendReminder({
        pendingStudentIds: pendingIds,
        subject: staffSubject,
      }).unwrap();


      
      message.success(res.message || "Reminder sent successfully");
    } catch (err) {
      message.error(err?.data?.message || "Failed to send reminders");
    } finally {
      setLoadingReminder(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: "24px" }}>
        Assignments Submission – {staffSubject || "Unknown"}
      </Title>

      {!staffSubject && (
        <Card style={{ marginBottom: 24, textAlign: "center", color: "red" }}>
          ⚠ Staff subject not found.
        </Card>
      )}

      <Card style={{ marginBottom: "24px" }}>
        <Table
          dataSource={submittedProjects}
          columns={[
            { title: "Student Name", dataIndex: "studentName" },
            {
              title: "Project Name",
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
          ]}
          rowKey="key"
          scroll={{ x: 600 }}
        />
      </Card>

      <Card style={{ textAlign: "center" }}>
        <Paragraph style={{ fontSize: "20px" }}>
          Send reminders to students who have not submitted.
        </Paragraph>

        <Button
          type="primary"
          onClick={handleSendReminder}
          disabled={!staffSubject || pendingStudents.length === 0}
          loading={loadingReminder}
        >
          Send Reminder
        </Button>
      </Card>
    </div>
  );
};

export default AssignmentCheck;