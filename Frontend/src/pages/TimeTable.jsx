import { Card, Table } from 'antd'
import React, { useMemo } from 'react'

// RTK Query
import { useGetUsersQuery } from "../redux/userApi"

const TimeTable = () => {

    const { data, isLoading, error } = useGetUsersQuery()

    const users = data?.users || []

    // Filter staff safely
    const staffUsers = useMemo(
        () => users.filter(user => user.role === "staff"),
        [users]
    )

    const columns = [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Day", dataIndex: "day", key: "day" },
        { title: "Subject", dataIndex: "subject", key: "subject" },
        { title: "Subject Staff", dataIndex: "staff", key: "staff" },
    ]

    // Normalize matching (VERY IMPORTANT)
    const getStaffByDepartment = (dept) => {
        const staff = staffUsers.find(
            s => s.department?.toLowerCase().trim() === dept.toLowerCase().trim()
        )
        return staff?.name || "Not Assigned"
    }

    const NULL = "-"

    // Memoize schedule (prevents re-running)
    const schedule = useMemo(() => ({
        Sunday: { subject: "Holiday", staff: NULL },
        Monday: { subject: "Java", staff: getStaffByDepartment("Java") },
        Tuesday: { subject: "Python", staff: getStaffByDepartment("Python") },
        Wednesday: { subject: "C", staff: getStaffByDepartment("C") },
        Thursday: { subject: "C++", staff: getStaffByDepartment("C++") },
        Friday: { subject: "DataScience", staff: getStaffByDepartment("DataScience") },
        Saturday: { subject: "Holiday", staff: NULL },
    }), [staffUsers])

    const generateWeekData = () => {
        const today = new Date()
        const firstDay = new Date(today)
        firstDay.setDate(today.getDate() - today.getDay())

        return Array.from({ length: 7 }).map((_, index) => {
            const currentDate = new Date(firstDay)
            currentDate.setDate(firstDay.getDate() + index)

            const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })

            return {
                key: index,
                date: currentDate.toLocaleDateString(),
                day: dayName,
                subject: schedule[dayName]?.subject || "-",
                staff: schedule[dayName]?.staff || "-",
            }
        })
    }

    const dataSource = useMemo(() => generateWeekData(), [schedule])

    if (isLoading) return <p>Loading timetable...</p>
    if (error) return <p>Error loading data</p>

    return (
        <div style={{ padding: 20 }}>
            <Card style={{ marginBottom: "10px" }}>
                <h1 className='text-center text-gray-600 text-2xl font-bold'>
                    Time Table
                </h1>
            </Card>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: 600 }}
            />

            <h1 className="text-xl text-gray-600 mt-5 text-center">
                Saturday and Sunday are always considered holidays.
            </h1>
        </div>
    )
}

export default TimeTable