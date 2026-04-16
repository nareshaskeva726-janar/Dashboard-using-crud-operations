import React, { useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Tabs,
  Spin,
  Empty,
} from "antd";
import dayjs from "dayjs";

import {
  useGetMyAttendanceQuery,
  useGetMonthlySummaryQuery,
} from "../redux/attendanceApi";

const { Title } = Typography;

const AttendanceStudent = () => {
  /* =====================================================
     CURRENT MONTH
  ===================================================== */
  const month = dayjs().month() + 1;
  const year = dayjs().year();

  /* =====================================================
     FETCH ATTENDANCE
  ===================================================== */
  const {
    data: attendanceRes,
    isLoading: loadingAttendance,
  } = useGetMyAttendanceQuery();

  console.log(attendanceRes, "attendanceData")

  /* =====================================================
     FETCH MONTHLY SUMMARY
  ===================================================== */
  const {
    data: summaryRes,
    isLoading: loadingSummary,
  } = useGetMonthlySummaryQuery({ month, year });

  console.log(summaryRes, "summaryres")

  /* =====================================================
     FORMAT DATA SAFELY
  ===================================================== */
  const attendanceData = useMemo(() => {
    return (
      attendanceRes?.attendance ||
      attendanceRes?.data?.attendance ||
      []
    );
  }, [attendanceRes]);

  console.log(attendanceData, "attendanceData");

  const summaryData = useMemo(() => {
    return summaryRes?.summary || [];
  }, [summaryRes]);

  console.log(summaryData, "summarydata")

  /* =====================================================
     DAILY ATTENDANCE TABLE
  ===================================================== */
  const dailyColumns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (date) =>
        dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "Present" ? (
          <Tag color="green">Present</Tag>
        ) : (
          <Tag color="red">Absent</Tag>
        ),
    },
  ];

  /* =====================================================
     MONTHLY SUMMARY TABLE
  ===================================================== */
  const summaryColumns = [
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Present",
      dataIndex: "present",
    },
    {
      title: "Absent",
      dataIndex: "absent",
    },
    {
      title: "Attendance %",
      dataIndex: "percentage",
      render: (p) => `${p}%`,
    },
  ];

  /* =====================================================
     GLOBAL LOADING
  ===================================================== */
  if (loadingAttendance || loadingSummary) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div
      style={{
        padding: 24,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Title level={3}>📘 My Attendance</Title>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Daily Attendance",
            children: (
              <Card style={{ borderRadius: 12 }}>
                {attendanceData.length === 0 ? (
                  <Empty description="No attendance records found" />
                ) : (
                  <Table
                    rowKey={(record) =>
                      record._id ||
                      `${record.date}-${record.subject}`
                    }
                    dataSource={attendanceData}
                    columns={dailyColumns}
                    pagination={{ pageSize: 10 }}
                  />
                )}
              </Card>
            ),
          },

          {
            key: "2",
            label: "Monthly Summary",
            children: (
              <Card style={{ borderRadius: 12 }}>
                {summaryData.length === 0 ? (
                  <Empty description="No monthly summary available" />
                ) : (
                  <Table
                    rowKey="subject"
                    dataSource={summaryData}
                    columns={summaryColumns}
                    pagination={false}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AttendanceStudent;