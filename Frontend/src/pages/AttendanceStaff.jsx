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
  useGetStaffSummaryQuery,
} from "../redux/attendanceApi";
import { useTheme } from "../context/ThemeContext";

import { useGetUsersQuery, useCheckAuthQuery } from "../redux/userApi";

const { Title, Text } = Typography;

const AttendanceStaff = () => {

  const { theme, toggleTheme } = useTheme();

  // ================= AUTH =================
  const { data: authUser, isLoading: authLoading } =
    useCheckAuthQuery();

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
  const { data: usersRes } = useGetUsersQuery();

  const usersData = Array.isArray(usersRes)
    ? usersRes
    : usersRes?.users || [];

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

  // ================= MONTHLY SUMMARY =================
  const {
    data: monthlyData,
    isLoading: monthlyLoading,
  } = useGetStaffSummaryQuery(
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
    if (!Array.isArray(usersData)) return [];

    return usersData
      .filter(
        (u) =>
          u.role === "student" &&
          u.department === staffDepartment
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
      }));
  }, [usersData, staffDepartment]);

  // ================= ATTENDANCE MAP =================
  const attendanceMap = useMemo(() => {
    const map = {};

    const attendanceArray = Array.isArray(staffData?.data)
      ? staffData.data
      : [];

    attendanceArray.forEach((a) => {
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
  const tableData = useMemo(() => {
    return studentsList.map((student) => {
      const record = attendanceMap[student._id];

      return {
        key: student._id,
        studentId: student._id,
        name: student.name,
        status: record?.status || "Not Marked",
        attendanceId: record?._id,
      };
    });
  }, [studentsList, attendanceMap]);

  // ================= SAFE MONTHLY ARRAY =================
  const monthlySummaryList = useMemo(() => {
    if (!monthlyData?.data) return [];

    if (Array.isArray(monthlyData.data)) {
      return monthlyData.data;
    }

    return [monthlyData.data];
  }, [monthlyData]);

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
            onClick={() =>
              handleMark(record.studentId, "present")
            }
          >
            Present
          </Button>

          <Button
            size="small"
            danger
            loading={marking}
            onClick={() =>
              handleMark(record.studentId, "absent")
            }
          >
            Absent
          </Button>

          {record?.attendanceId && (
            <Button
              size="small"
              onClick={async () => {
                try {
                  await deleteAttendance(
                    record.attendanceId
                  ).unwrap();
                  message.success("Deleted");
                  refetch();
                } catch {
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

  // ================= SUMMARY COLUMNS =================
  const summaryColumns = [
    { title: "subject", dataIndex: "subject" },
    { title: "Total", dataIndex: "total" },
    { title: "Present", dataIndex: "present" },
    { title: "absent", dataIndex: "absent" },

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
    <div
      style={{
        padding: 16,
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Row justify="space-between">
        <Col>
          <Title level={3} style={{ color: theme === "dark" ? "#fff" : "#000" }}>Attendance Management</Title>
          <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>Department: {staffDepartment}</Text>
        </Col>
      </Row>

      {/* FILTER */}
      <Card style={{ marginTop: 16 }}
        className={theme === "dark" ? "dark-card" : ""}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Text style={{ color: theme === "dark" ? "#fff" : "#000"}}>Subject</Text>

            <Select
              value={subject}
              onChange={setSubject}
              style={{
                width: "100%", color: theme === "dark" ? "#fff" : "#000",
                background: theme === "dark" ? "#333" : "#fff",
                border:
                  theme === "dark"
                    ? "1px solid #2a2a2a"
                    : "1px solid #e5e7eb",

              }}
              className={theme === "dark" ? "dark-select" : "light-select"}
              popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
            >
              {staffSubjects.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={12}>
            <Text style={{

              color: theme === "dark" ? "#fff" : "#000"

            }}>Date</Text>
            <DatePicker
              value={date}
              onChange={setDate}
              style={{
                width: "100%",
                background: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                border:
                  theme === "dark"
                    ? "1px solid #2a2a2a"
                    : "1px solid #e5e7eb",

              }}
            />
          </Col>
        </Row>
      </Card>

      {/* MARK TABLE */}
      <Card title={<span style={{ color: theme === 'dark' ? "#fff" : "#000" }}>Mark Attendance</span>} style={{ marginTop: 16 }}
        className={theme === "dark" ? "dark-card" : ""}
      >
        <Table
          className={theme === "dark" ? "dark-table" : ""}
          scroll={{ x: true }}
          loading={isFetching}
          dataSource={tableData}
          columns={columns}
          pagination={false}
        />
      </Card>

      {/* SUMMARY */}
      <Card title={<span style={{ color: theme === 'dark' ? "#fff" : "#000" }}>Monthly Summary</span>} style={{ marginTop: 16 }}
        className={theme === "dark" ? "dark-card" : ""}
      >
        <Table
          className={theme === "dark" ? "dark-table" : ""}
          scroll={{ x: true }}
          loading={monthlyLoading}
          dataSource={monthlySummaryList}
          columns={summaryColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AttendanceStaff;