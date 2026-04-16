import React, { useMemo } from "react";
import { Card, Table, Spin, Tag } from "antd";
import { useGetUsersQuery, useCheckAuthQuery } from "../redux/userApi";

/* =========================
   Department Subjects
========================= */
const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
  CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
  MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
  CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"],
};

/* =========================
   Weekdays & Periods
========================= */
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const periods = [
  { name: "Period 1", time: "09:00-10:00" },
  { name: "Period 2", time: "10:00-11:00" },
  { name: "Period 3", time: "11:00-12:00" },
  { name: "Break", time: "12:00-13:00" },
  { name: "Period 5", time: "13:00-14:00" },
  { name: "Period 6", time: "14:00-15:00" },
];

const TimeTable = () => {
  /* ================= AUTH ================= */
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const department = authData?.user?.department;

  /* ================= STAFF ================= */
  const { data, isLoading } = useGetUsersQuery();
  const users = data?.users || [];

  /* ================= STAFF MAP ================= */
  const subjectStaffMap = useMemo(() => {
    const map = {};
    users
      .filter((u) => u.role === "staff")
      .forEach((staff) => {
        staff.subjects?.forEach((sub) => {
          map[sub] = staff.name;
        });
      });
    return map;
  }, [users]);

  const subjects = departmentSubjectsMap[department] || [];

  /* ================= ROTATIONAL TIMETABLE ================= */
  const tableData = useMemo(() => {
    const totalSubjects = subjects.length;

    return periods.map((periodItem, periodIndex) => {
      const row = {
        key: periodIndex,
        period: `${periodItem.name} (${periodItem.time})`,
      };

      weekdays.forEach((day, dayIndex) => {
        if (periodItem.name === "Break") {
          row[day] = "Break";
          return;
        }

        const subjectIndex =
          (dayIndex + (periodIndex > 2 ? periodIndex - 1 : periodIndex)) %
          totalSubjects;

        row[day] = subjects[subjectIndex];
      });

      return row;
    });
  }, [subjects]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    { title: "Period", dataIndex: "period", fixed: "left" },
    ...weekdays.map((day) => ({
      title: day,
      dataIndex: day,
      render: (subject) =>
        subject === "Break" ? (
          <Tag color="orange">Break</Tag>
        ) : (
          <>
            <div>{subject}</div>
            <small className="text-gray-500">
              {subjectStaffMap[subject] || "-"}
            </small>
          </>
        ),
    })),
  ];

  /* ================= TODAY INFO ================= */
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0 = Sunday, 6 = Saturday
  const todayText =
    todayDayIndex === 0 || todayDayIndex === 6
      ? "Holiday"
      : weekdays[todayDayIndex - 1];

  if (authLoading || isLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-3">
          {department || "-"} Department Timetable
        </h2>

        <div className="flex gap-5 justify-center">
          <p className="text-center mb-5">
            Today: <strong>{todayText}</strong>
          </p>
          <p className="text-center mb-5">
            Department: <strong>{department}</strong>
          </p>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
          scroll={{ x: 900 }}
        />

        <p className="text-center mt-4 text-gray-500">
          Period 3 → Break | Saturday & Sunday → Holiday
        </p>
      </Card>
    </div>
  );
};

export default TimeTable;