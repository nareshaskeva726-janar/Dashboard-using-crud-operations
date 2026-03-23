import React, { useMemo } from "react";
import { Card, Table, Tag, Spin, Empty, Divider } from "antd";
import { useGetMyAttendanceQuery } from "../redux/attendanceApi";

const Attendance = () => {
  
  const { data, isLoading, isError } = useGetMyAttendanceQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchInterval: 10000, 
  });

  const subjectSchedule = { 1: "Java", 2: "Python", 3: "C", 4: "C++", 5: "DataScience" };

  
  const attendanceData = useMemo(() => {
    if (!data) return [];

    const attendanceMap = {};
    data.forEach((record) => {
      const dateStr = new Date(record.date).toLocaleDateString("en-CA");
      const key = `${dateStr}-${record.subject}`;
      attendanceMap[key] = record.status;
    });

    const today = new Date();
    const records = [];

    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const day = date.getDay();
      const dateStr = date.toLocaleDateString("en-CA");
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      let subject = subjectSchedule[day] || "Unknown";
      let status;

      if (day === 0 || day === 6) {
        subject = "Holiday";
        status = "Holiday";
      } else {
        const key = `${dateStr}-${subject}`;
        status = attendanceMap[key] || dayName;
      }

      records.push({ date: dateStr, day: dayName, subject, status });
    }
    return records;
  }, [data]); 


  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    attendanceData.forEach((item) => {
      if (item.status === "Present") present++;
      else if (item.status === "Absent") absent++;
    });
    const total = present + absent;
    const percentage = total ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  }, [attendanceData]);

  const columns = [
    { title: "Date", dataIndex: "date", render: (text) => new Date(text).toLocaleDateString() },
    { title: "Day", dataIndex: "day" },
    { title: "Subject", dataIndex: "subject" },
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

  const user = JSON.parse(localStorage.getItem("user")) || {};

  if (isLoading) return <div className="flex justify-center mt-10"><Spin size="large" /></div>;
  if (isError) return <div className="text-center mt-10 text-red-500">Failed to load attendance</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        <h1 className="text-2xl font-semibold">Student Name: {user.name}</h1>
        <p className="text-gray-500 mb-4">Student Email: {user.email}</p>

        <Divider orientation="center">Monthly Summary</Divider>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border border-gray-200 p-6 rounded-lg mb-6">
          <div className="flex flex-col text-gray-500">
            <span>Total</span>
            <span className="text-2xl font-semibold">{summary.total}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Present</span>
            <span className="text-2xl font-semibold text-green-600">{summary.present}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Absent</span>
            <span className="text-2xl font-semibold text-red-600">{summary.absent}</span>
          </div>
          <div className="flex flex-col text-gray-500">
            <span>Percentage</span>
            <span className="text-2xl font-semibold">{summary.percentage}%</span>
          </div>
        </div>

        <Divider orientation="center">Attendance Records</Divider>

        {attendanceData.length === 0 ? (
          <Empty description="No attendance records found" />
        ) : (
          <Table
            columns={columns}
            dataSource={attendanceData}
            rowKey={(record) => `${record.date}-${record.subject}`}
            pagination={{ pageSize: 8 }}
            rowClassName={(record) => (record.status === "Holiday" ? "bg-gray-100" : "")}
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Attendance;