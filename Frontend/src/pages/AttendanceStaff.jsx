import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  Table,
  Select,
  Typography,
  Row,
  Col,
  DatePicker,
  Tag,
  Button,
  Space,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";

// RTK
import {
  useMarkAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetStaffAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import { useGetUsersQuery, useCheckAuthQuery } from "../redux/userApi";

const { Title, Text } = Typography;

const AttendanceStaff = () => {
  // ================= AUTH =================
  const { data: authUser, isLoading: authLoading } = useCheckAuthQuery();

  const staff = authUser?.user;
  const staffDepartment = staff?.department;
  const staffSubjects = staff?.subjects || [];

  // ================= STATE =================
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(dayjs());

  useEffect(() => {
    if (staffSubjects.length && !subject) {
      setSubject(staffSubjects[0]);
    }
  }, [staffSubjects, subject]);

  // ================= USERS =================
  const { data: usersData = [] } = useGetUsersQuery();

  // ================= ATTENDANCE =================
  const {
    data: staffData,
    refetch,
    isFetching,
  } = useGetStaffAttendanceQuery(
    {
      department: staffDepartment,
      subject,
      date: date.format("YYYY-MM-DD"),
    },
    { skip: !staffDepartment || !subject }
  );

  // ================= SUMMARY =================
  const { data: monthlyData } = useGetMonthlySummaryQuery(
    {
      department: staffDepartment,
      subject,
      month: date.month() + 1,
      year: date.year(),
    },
    { skip: !staffDepartment || !subject }
  );

  // ================= MUTATIONS =================
  const [markAttendance, { isLoading: marking }] =
    useMarkAttendanceMutation();

  const [deleteAttendance] = useDeleteAttendanceMutation();

  // ================= STUDENTS =================
  const studentsList = useMemo(() => {
    return usersData
      .filter(
        (u) => u.role === "student" && u.department === staffDepartment
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
      }));
  }, [usersData, staffDepartment]);

  // ================= ATTENDANCE MAP (FIXED) =================
  const attendanceMap = useMemo(() => {
    const map = {};

    staffData?.data?.forEach((a) => {
      const key = a.studentId?._id || a.studentId;
      map[key] = a;
    });

    return map;
  }, [staffData]);

  // ================= MARK =================
  const handleMark = async (studentId, status) => {
    try {
      await markAttendance({
        department: staffDepartment,
        subject,
        date: date.toISOString(),
        students: [{ studentId, status }],
      }).unwrap();

      message.success("Attendance marked");
      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Failed");
    }
  };

  // ================= TABLE DATA =================
  const tableData = studentsList.map((student) => {
    const record = attendanceMap[student._id];

    return {
      key: student._id,
      studentId: student._id,
      name: student.name,
      status: record?.status || "Not Marked",
      attendanceId: record?._id,
    };
  });

  // ================= COLUMNS =================
  const columns = [
    {
      title: "Student",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "present"
              ? "green"
              : status === "absent"
              ? "red"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            loading={marking}
            onClick={() => handleMark(record.studentId, "present")}
          >
            Present
          </Button>

          <Button
            size="small"
            danger
            loading={marking}
            onClick={() => handleMark(record.studentId, "absent")}
          >
            Absent
          </Button>

          {record?.attendanceId && (
            <Button
              size="small"
              onClick={async () => {
                try {
                  await deleteAttendance(record.attendanceId).unwrap();
                  message.success("Deleted");
                  refetch();
                } catch (err) {
                  message.error("Delete failed");
                }
              }}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ================= SUMMARY =================
  const summaryColumns = [
    { title: "Student", dataIndex: "studentName" },
    { title: "Total", dataIndex: "total" },
    { title: "Present", dataIndex: "present" },
    {
      title: "Percentage",
      render: (_, record) => (
        <Tag color={record.percentage >= 75 ? "green" : "red"}>
          {record.percentage}%
        </Tag>
      ),
    },
  ];

  if (authLoading) return <Spin fullscreen />;

  return (
    <div style={{ padding: 16, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <Row justify="space-between">
        <Col>
          <Title level={3}>Attendance Management</Title>
          <Text>Department: {staffDepartment}</Text>
        </Col>
      </Row>

      {/* FILTER */}
      <Card style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Text>Subject</Text>
            <Select
              value={subject}
              onChange={setSubject}
              style={{ width: "100%" }}
            >
              {staffSubjects.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={12}>
            <Text>Date</Text>
            <DatePicker
              value={date}
              onChange={setDate}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      {/* MARK TABLE */}
      <Card title="Mark Attendance" style={{ marginTop: 16 }}>
        <Table
          loading={isFetching}
          dataSource={tableData}
          columns={columns}
          pagination={false}
        />
      </Card>

      {/* SUMMARY */}
      <Card title="Monthly Summary" style={{ marginTop: 16 }}>
        <Table
          dataSource={monthlyData?.data || []}
          columns={summaryColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AttendanceStaff;