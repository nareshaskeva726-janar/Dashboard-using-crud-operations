import React, { useMemo } from "react";
import {
  Table,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Progress,
  Spin,
  Empty,
} from "antd";

import {
  useGetMyAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

import { useCheckAuthQuery } from "../redux/userApi";

const { Title, Text } = Typography;

const AttendanceStudent = () => {

  /* ================= AUTH ================= */
  const { data: authUser, isLoading: authLoading } =
    useCheckAuthQuery();

  const student = authUser?.user;
  const subjects = student?.subjects || [];

  /* ================= ATTENDANCE ================= */
  const {
    data: attendanceRes,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useGetMyAttendanceQuery(undefined, {
    skip: !student,
  });

  const attendanceList = attendanceRes?.data || [];

  /* ================= MONTHLY SUMMARY ================= */
  const {
    data: summaryRes,
    isLoading: summaryLoading,
  } = useGetMonthlySummaryQuery(undefined, {
    skip: !student,
  });

  const summaryList = summaryRes?.data || [];

  /* ================= DAILY TABLE ================= */
  const attendanceData = useMemo(() => {
    return attendanceList.map((item, index) => ({
      key: item._id || index,
      date: new Date(item.date).toLocaleDateString(),
      subject: item.subject,
      period: item.period ?? "—",
      status: item.status,
    }));
  }, [attendanceList]);

  /* ================= MONTHLY TABLE ================= */
  const monthlyData = useMemo(() => {
    return summaryList.map((item, index) => ({
      key: index,
      subject: item.subject,
      totalClasses: item.total,
      attended: item.present,
      percent: Number(item.percentage),
    }));
  }, [summaryList]);

  /* ================= OVERALL % ================= */
  const overallPercentage = useMemo(() => {
    if (!monthlyData.length) return 0;

    const total = monthlyData.reduce(
      (sum, s) => sum + s.totalClasses,
      0
    );

    const attended = monthlyData.reduce(
      (sum, s) => sum + s.attended,
      0
    );

    return total ? Math.round((attended / total) * 100) : 0;
  }, [monthlyData]);

  const riskStatus =
    overallPercentage >= 75
      ? "Good Standing"
      : "Low Attendance";

  /* ================= TABLE COLUMNS ================= */

  const monthlyColumns = [
    { title: "Subject", dataIndex: "subject" },
    { title: "Total Classes", dataIndex: "totalClasses" },
    { title: "Attended", dataIndex: "attended" },
    {
      title: "Attendance %",
      dataIndex: "percent",
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={value < 75 ? "exception" : "active"}
        />
      ),
    },
  ];

  const attendanceColumns = [
    { title: "Date", dataIndex: "date" },
    { title: "Subject", dataIndex: "subject" },
    { title: "Period", dataIndex: "period" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "present" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  /* ================= LOADING ================= */
  if (authLoading || attendanceLoading || summaryLoading)
    return <Spin fullscreen />;

  /* ================= ACCESS ERROR ================= */
  if (attendanceError)
    return <Empty description="Login as Student to view attendance" />;

  /* ================= UI ================= */
  return (
    <div
      style={{
        padding: 20,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Row justify="space-between">
        <Col>
          <Title level={3}>My Attendance</Title>
          <Text type="secondary">
            Track your attendance performance
          </Text>
        </Col>
      </Row>

      {/* SUMMARY CARDS */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Total Subjects</Title>
            <Title level={2}>{subjects.length}</Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Overall Attendance</Title>
            <Title level={2} style={{ color: "#1890ff" }}>
              {overallPercentage}%
            </Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Status</Title>
            <Tag
              color={overallPercentage >= 75 ? "green" : "red"}
            >
              {riskStatus}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* MONTHLY SUMMARY */}
      <Card style={{ marginTop: 16 }} title="Monthly Summary">
        {monthlyData.length ? (
          <Table
            dataSource={monthlyData}
            columns={monthlyColumns}
            pagination={false}
          />
        ) : (
          <Empty description="No summary available" />
        )}
      </Card>

      {/* DAILY ATTENDANCE */}
      <Card style={{ marginTop: 16 }} title="Attendance Details">
        {attendanceData.length ? (
          <Table
            dataSource={attendanceData}
            columns={attendanceColumns}
            pagination={{ pageSize: 5 }}
          />
        ) : (
          <Empty description="No attendance records" />
        )}
      </Card>
    </div>
  );
};

export default AttendanceStudent;