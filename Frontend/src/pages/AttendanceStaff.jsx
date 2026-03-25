import { DeleteOutlined, EditOutlined } from "@ant-design/icons"

import React, { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Table,
  Radio,
  Row,
  Col,
  Statistic,
  Divider,
  Popconfirm,
  message,
} from "antd";
import {
  useGetUsersQuery,
  useCheckAuthQuery,
} from "../redux/userApi";
import {
  useCheckAttendanceQuery,
  useMarkAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

const AttendanceStaff = () => {
  const { data: usersData } = useGetUsersQuery();
  const { data: authData } = useCheckAuthQuery();

  const [markAttendance] = useMarkAttendanceMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const todayISO = today.toLocaleDateString("en-CA");
  const todayDayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const day = today.getDay();

  const subjectSchedule = { 1: "Java", 2: "Python", 3: "C", 4: "C++", 5: "DataScience" };
  const todaySubject = day === 0 || day === 6 ? "" : subjectSchedule[day];

  // Fetch existing attendance for today
  const {
    data: checkData,
    isLoading: checkLoading,
    refetch: refetchAttendance,
  } = useCheckAttendanceQuery(todaySubject, {
    skip: !todaySubject,
    refetchOnMountOrArgChange: true,
  });

  // Fetch monthly summary
  const { data: summaryData } = useGetMonthlySummaryQuery({ month, year });

  // Build student attendance table data
  const attendanceData = useMemo(() => {
    if (!usersData?.users || !authData?.user || !todaySubject) return [];

    const studentsOnly = usersData.users.filter((u) => u.role === "student");

    return studentsOnly.map((student) => {
      const existingRecord = checkData?.records?.find(
        (r) => r.studentId === student._id
      );
      return {
        _id: student._id,
        studentId: student._id,
        StudentName: student.name,
        status: existingRecord?.status || "Present", // default Present
      };
    });
  }, [usersData, authData, checkData, todaySubject]);

  // Determine if attendance is already submitted
  const isSubmitted = !!checkData?.submitted;

  // Only allow staff from the same department to mark attendance
  const canAccess = authData?.user?.department === todaySubject;
  const canSubmit = !!todaySubject && canAccess && !isSubmitted;

  // Handle marking a student present/absent
  const handleAttendanceChange = (id, status) => {
    const record = attendanceData.find((s) => s._id === id);
    if (record) record.status = status; // mutate local array for instant UI update
  };

  // Mark all present
  const markAllPresent = () => {
    attendanceData.forEach((s) => (s.status = "Present"));
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await markAttendance({
        students: attendanceData.map((s) => ({ studentId: s.studentId, status: s.status })),
      }).unwrap();

      message.success("Attendance submitted successfully!");
      refetchAttendance(); // refresh data immediately
    } catch {
      message.error("Submit failed!");
    }
  };

  // Delete attendance
  const handleDeleteAttendance = async () => {
    try {
      await deleteAttendance({ date: todayISO, subject: todaySubject }).unwrap();
      message.success("Attendance deleted!");
      refetchAttendance(); // refresh data immediately
    } catch {
      message.error("Delete failed!");
    }
  };

  // Compute today's summary
  const summaryToday = useMemo(() => {
    let present = 0;
    let absent = 0;

    attendanceData.forEach((s) => {
      if (s.status === "Present") present++;
      else absent++;
    });

    const total = present + absent;
    const percentage = total ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, percentage };
  }, [attendanceData]);

  const columns = [
    { title: "Student Name", dataIndex: "StudentName" },
    {
      title: "Attendance",
      render: (_, record) => (
        <Radio.Group
          value={record.status}
          onChange={(e) => handleAttendanceChange(record._id, e.target.value)}
        >
          <Radio value="Present">Present</Radio>
          <Radio value="Absent">Absent</Radio>
        </Radio.Group>
      ),
    },
  ];

  if (checkLoading) return <p>Loading today's attendance...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {summaryData?.summary && (
        <Card className="mb-6">
          <h2>Monthly Summary ({month}/{year})</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Statistic title="Total Days" value={summaryData.summary.totalDays} />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Statistic title="Present" value={summaryData.summary.present} />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Statistic title="Absent" value={summaryData.summary.absent} />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Statistic title="Leave" value={summaryData.summary.leave} />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-2">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Statistic title="Attendance %" value={summaryData.summary.percentage} suffix="%" />
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <h2>Staff Attendance Panel</h2>
        <p>Date: {today.toLocaleDateString()}</p>
        <p>Day: {todayDayName}</p>
        <p>Subject: {todaySubject || "N/A"}</p>

        <Divider>Today's Summary</Divider>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border border-gray-200 p-6 rounded-lg">
          <div className="flex flex-col text-gray-500">
            <span>Total</span>
            <span className="text-2xl font-semibold">{summaryToday.total}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Present</span>
            <span className="text-2xl font-semibold">{summaryToday.present}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Absent</span>
            <span className="text-2xl font-semibold">{summaryToday.absent}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Percentage</span>
            <span className="text-2xl font-semibold">{summaryToday.percentage}</span>
          </div>
        </div>

        <Divider>Mark Attendance</Divider>
        {!canAccess ? (
          <p className="text-red-500">Today is not your subject.</p>
        ) : !isSubmitted ? (
          <>
            <Button className="mb-4" onClick={markAllPresent}>Mark All Present</Button>
            <Table columns={columns} dataSource={attendanceData} rowKey="_id" />
            <Button className="mt-4" type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </>
        ) : (
          <div className="flex justify-between mt-4 items-center">
            <p className="text-green-600 text-lg">Today's Attendance Recorded</p>

            <div className="flex gap-5 items-center">

         

              <Popconfirm title="Delete attendance?" onConfirm={handleDeleteAttendance}>
                <div className="flex gap-1  cursor-pointer">
                  <DeleteOutlined style={{ color: "red", }} /> <p className="text-red-500">Delete</p>
                </div>
              </Popconfirm>

            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceStaff;