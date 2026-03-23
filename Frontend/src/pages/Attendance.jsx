import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import { useGetMyAttendanceQuery } from "../redux/attendanceApi";

const Attendance = () => {
  const { data, isLoading, isError } = useGetMyAttendanceQuery();
  const [attendanceData, setAttendanceData] = useState([]);

  const subjectSchedule = {
    1: "Java",
    2: "Python",
    3: "C",
    4: "C++",
    5: "DataScience",
  };

  // ✅ Prepare attendance data (INCLUDING weekends)
  useEffect(() => {
    if (!data?.attendance) return;

    const attendanceMap = {};
    data.attendance.forEach((record) => {
      attendanceMap[record.date + record.subject] = record.status;
    });

    const today = new Date();
    const records = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const day = date.getDay();
      const dateStr = date.toISOString().split("T")[0];

      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      let subject = subjectSchedule[day];
      let status = attendanceMap[dateStr + subject] || "Absent";

      // ✅ Mark weekends as Holiday
      if (day === 0 || day === 6) {
        subject = "-";
        status = "Holiday";
      }

      records.push({
        date: dateStr,
        day: dayName,
        subject,
        status,
      });
    }

    setAttendanceData(records);
  }, [data]);

  // ✅ Monthly summary (excluding holidays)
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    attendanceData.forEach((item) => {
      if (item.status === "Present") present++;
      else if (item.status === "Absent") absent++;
    });

    const total = present + absent;
    const percentage = total
      ? ((present / total) * 100).toFixed(1)
      : 0;

    return { total, present, absent, percentage };
  }, [attendanceData]);

  // ✅ Table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Day",
      dataIndex: "day",
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color = "red";

        if (status === "Present") color = "green";
        else if (status === "Holiday") color = "blue";

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load attendance
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        {/* ✅ User Info */}
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-500 mb-4">{user.email}</p>

        {/* ✅ Summary */}
        <Divider orientation="left">Monthly Summary</Divider>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Statistic title="Total Days" value={summary.total} />
          </Col>
          <Col span={6}>
            <Statistic
              title="Present"
              value={summary.present}
              valueStyle={{ color: "green" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Absent"
              value={summary.absent}
              valueStyle={{ color: "red" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Attendance %"
              value={summary.percentage}
              suffix="%"
            />
          </Col>
        </Row>

        {/* ✅ Table */}
        <Divider orientation="left">Attendance Records</Divider>

        {attendanceData.length === 0 ? (
          <Empty description="No attendance records found" />
        ) : (
          <Table
            columns={columns}
            dataSource={attendanceData}
            rowKey={(record) => record.date + record.subject}
            pagination={{ pageSize: 8 }}
            rowClassName={(record) =>
              record.status === "Holiday" ? "bg-gray-100" : ""
            }
          />
        )}
      </Card>
    </div>
  );
};

export default Attendance;