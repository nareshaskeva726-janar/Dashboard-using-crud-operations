import {
  Button,
  Card,
  Table,
  Radio,
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Alert,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useGetUsersQuery, useCheckAuthQuery } from "../redux/userApi";
import { useMarkAttendanceMutation } from "../redux/attendanceApi";

const AttendanceStaff = () => {
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const [markAttendance, { isLoading: submitting }] = useMarkAttendanceMutation();

  const [attendanceData, setAttendanceData] = useState([]);
  const [todaySubject, setTodaySubject] = useState("");
  const [canSubmit, setCanSubmit] = useState(true);
  const [todayDay, setTodayDay] = useState("");
  const [todayDate, setTodayDate] = useState("");

  // ✅ Detect day + subject
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();

    const subjectSchedule = {
      1: "Java",
      2: "Python",
      3: "C",
      4: "C++",
      5: "DataScience",
    };

    const detectedDay = today.toLocaleDateString("en-US", {
      weekday: "long",
    });

    setTodayDay(detectedDay);
    setTodayDate(today.toLocaleDateString());

    if (day === 0 || day === 6) {
      setCanSubmit(false);
      setTodaySubject("");
    } else {
      setTodaySubject(subjectSchedule[day]);
      setCanSubmit(true);
    }
  }, []);

  // ✅ Load students (FIXED)
  useEffect(() => {
    if (!usersData?.users || !authData?.user) return;

    // wait until subject is set
    if (!todaySubject) return;

    // check department match
    if (authData.user.department !== todaySubject) {
      setCanSubmit(false);
      message.warning("You cannot submit attendance for today!");
      return;
    }

    const studentsOnly = usersData.users.filter(
      (u) => u.role === "student"
    );

    const initialData = studentsOnly.map((student) => ({
      _id: student._id,
      studentId: student._id,
      StudentName: student.name,
      status: "Present",
    }));

    setAttendanceData(initialData);
  }, [usersData, authData, todaySubject]);

  // ✅ Change attendance
  const handleAttendanceChange = (id, status) => {
    setAttendanceData((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, status } : s
      )
    );
  };

  // ✅ Mark all present
  const markAllPresent = () => {
    setAttendanceData((prev) =>
      prev.map((s) => ({ ...s, status: "Present" }))
    );
  };

  // ✅ Submit
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const payload = {
        date: new Date().toISOString().split("T")[0],
        subject: todaySubject,
        students: attendanceData.map((s) => ({
          studentId: s.studentId,
          status: s.status,
        })),
      };

      await markAttendance(payload).unwrap();
      message.success("Attendance submitted successfully ✅");
    } catch (error) {
      message.error("Failed ❌");
    }
  };

  // ✅ Summary
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    attendanceData.forEach((s) => {
      if (s.status === "Present") present++;
      else absent++;
    });

    const total = present + absent;
    const percentage = total
      ? ((present / total) * 100).toFixed(1)
      : 0;

    return { total, present, absent, percentage };
  }, [attendanceData]);

  // ✅ Table columns
  const columns = [
    { title: "Student Name", dataIndex: "StudentName" },
    {
      title: "Attendance",
      render: (_, record) => (
        <Radio.Group
          value={record.status}
          onChange={(e) =>
            handleAttendanceChange(record._id, e.target.value)
          }
        >
          <Radio value="Present">Present</Radio>
          <Radio value="Absent">Absent</Radio>
        </Radio.Group>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold mb-2">
          Staff Attendance Panel
        </h1>

        <p className="text-gray-500">Date: {todayDate}</p>
        <p className="text-gray-500">Day: {todayDay}</p>
        <p className="text-gray-500 mb-4">
          Subject: {todaySubject || "N/A"}
        </p>

        {!canSubmit ? (
          <Alert
            message="Holiday"
            description={`Today is ${todayDay}. Attendance is not required.`}
            type="warning"
            showIcon
            className="mb-4"
          />
        ) : (
          <Alert
            message="Working Day"
            description={`You can mark attendance for ${todaySubject}`}
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        <Divider orientation="left">Today's Summary</Divider>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Statistic title="Total" value={summary.total} />
          </Col>
          <Col span={6}>
            <Statistic title="Present" value={summary.present} />
          </Col>
          <Col span={6}>
            <Statistic title="Absent" value={summary.absent} />
          </Col>
          <Col span={6}>
            <Statistic title="%" value={summary.percentage} suffix="%" />
          </Col>
        </Row>

        {canSubmit && (
          <div className="mb-4 flex gap-2">
            <Button onClick={markAllPresent}>
              Mark All Present
            </Button>
          </div>
        )}

        <Divider orientation="left">Mark Attendance</Divider>

        <Table
          columns={columns}
          dataSource={attendanceData}
          rowKey="_id"
          loading={usersLoading || authLoading}
          pagination={{ pageSize: 8 }}
        />

        <Button
          className="mt-4"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit || attendanceData.length === 0}
        >
          Submit Attendance
        </Button>
      </Card>
    </div>
  );
};

export default AttendanceStaff;