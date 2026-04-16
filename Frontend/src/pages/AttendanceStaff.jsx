import React, { useMemo, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Tabs,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Divider,
  Spin,
  message,
} from "antd";

import dayjs from "dayjs";

import {
  useMarkAttendanceMutation,
  useGetAllAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import {
  useCheckAuthQuery,
  useGetUsersQuery,
} from "../redux/userApi";

const { Title } = Typography;
const { Option } = Select;

const AttendanceStaff = () => {

  /* ================= AUTH ================= */
  const { data: authData, isLoading: authLoading } =
    useCheckAuthQuery();

  const staff = authData?.user || {};
  const department = staff?.department || "";
  const staffSubjects = staff?.subjects || [];

  /* ================= USERS ================= */
  const { data: usersData, isLoading: usersLoading } =
    useGetUsersQuery();

  const users =
    usersData?.users ||
    usersData?.data?.users ||
    usersData ||
    [];

  const students = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === "student" &&
        u.department === department
    );
  }, [users, department]);

  /* ================= STATE ================= */
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSubject, setSelectedSubject] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState("1");

  // local attendance state
  const [attendance, setAttendance] = useState({});

  /* ================= API ================= */
  const [markAttendance, { isLoading: marking }] =
    useMarkAttendanceMutation();

  const month = selectedDate.month() + 1;
  const year = selectedDate.year();

  const { data: summaryData, isLoading: summaryLoading } =
    useGetMonthlySummaryQuery(
      { month, year, department },
      { skip: !department }
    );

    console.log(summaryData, "summarydata")

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
  } = useGetAllAttendanceQuery(
    {
      department,
      subject: selectedSubject,
      date: selectedDate.format("YYYY-MM-DD"),
    },
    { skip: !selectedSubject }
  );

  /* ================= LOAD EXISTING ATTENDANCE ================= */
  React.useEffect(() => {
    if (!attendanceData?.data) return;

    const map = {};
    attendanceData.data.forEach((rec) => {
      map[rec.studentId._id] = rec.status;
    });

    setAttendance(map);
  }, [attendanceData]);

  /* ================= SELECT STATUS ================= */
  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  /* ================= SAVE ATTENDANCE ================= */
  const handleSubmit = async () => {
    if (!selectedSubject)
      return message.warning("Select subject");

    const records = students.map((s) => ({
      studentId: s._id,
      status: attendance[s._id] || "absent",
    }));

    try {
      await markAttendance({
        subject: selectedSubject,
        period: selectedPeriod,
        date: selectedDate.format("YYYY-MM-DD"),
        records,
      }).unwrap();

      message.success("Attendance Saved ✅");
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  /* ================= TABLE ================= */
  const markColumns = [
    {
      title: "Student",
      dataIndex: "name",
    },
    {
      title: "Status",
      render: (_, record) => (
        <Select
          value={attendance[record._id]}
          style={{ width: 140 }}
          onChange={(v) => setStatus(record._id, v)}
        >
          <Option value="present">Present</Option>
          <Option value="absent">Absent</Option>
        </Select>
      ),
    },
  ];

  const recordColumns = [
    {
      title: "Student",
      dataIndex: ["studentId", "name"],
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => dayjs(d).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) =>
        s === "present" ? (
          <Tag color="green">Present</Tag>
        ) : (
          <Tag color="red">Absent</Tag>
        ),
    },
  ];

  if (authLoading || usersLoading)
    return <Spin fullscreen />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📘 Staff Attendance</Title>

      {/* CONTROLS */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              style={{ width: "100%" }}
            />
          </Col>

          <Col span={6}>
            <Select
              placeholder="Subject"
              value={selectedSubject}
              onChange={setSelectedSubject}
              style={{ width: "100%" }}
            >
              {staffSubjects.map((s) => (
                <Option key={s}>{s}</Option>
              ))}
            </Select>
          </Col>

          <Col span={6}>
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: "100%" }}
            >
              {[1,2,3,4,5,6].map((p) => (
                <Option key={p} value={String(p)}>
                  Period {p}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={6}>
            <Button
              type="primary"
              block
              loading={marking}
              onClick={handleSubmit}
            >
              Save Attendance
            </Button>
          </Col>
        </Row>
      </Card>

      <Tabs
        items={[
          {
            key: "1",
            label: "Mark Attendance",
            children: (
              <Table
                rowKey="_id"
                dataSource={students}
                columns={markColumns}
                pagination={false}
              />
            ),
          },
          {
            key: "2",
            label: "Monthly Summary",
            children: (
              <Table
                loading={summaryLoading}
                dataSource={summaryData?.data || []}
                rowKey="_id"
                pagination={false}
                columns={[
                  { title: "Student", dataIndex: "studentName" },
                  { title: "Present", dataIndex: "present" },
                  { title: "Absent", dataIndex: "absent" },
                  {
                    title: "Percentage",
                    dataIndex: "percentage",
                    render: (p) => `${p?.toFixed(1)}%`,
                  },
                ]}
              />
            ),
          },
          {
            key: "3",
            label: "All Records",
            children: (
              <Table
                loading={attendanceLoading}
                dataSource={attendanceData?.data || []}
                rowKey="_id"
                columns={recordColumns}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default AttendanceStaff;