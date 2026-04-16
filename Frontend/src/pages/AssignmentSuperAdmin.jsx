import React, { useState, useMemo } from "react";
import { Table, Select, Spin, Tag } from "antd";
import { useGetAllProjectsSuperadminQuery } from "../redux/projectApi";

const { Option } = Select;

const AssignmentSuperAdmin = () => {
    const { data, isLoading } = useGetAllProjectsSuperadminQuery();

    console.log("API DATA:", data);


    // ✅ FIXED HERE
    const projects = Array.isArray(data?.data) ? data.data : [];

    const [departmentFilter, setDepartmentFilter] = useState("");

    /* ================= UNIQUE DEPARTMENTS ================= */
    const departments = useMemo(() => {
        const deptSet = new Set(projects.map((p) => p.department));
        return Array.from(deptSet);
    }, [projects]);

    /* ================= FILTERED DATA ================= */
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const filePath =
                p.projectFile?.path || p.projectFile;

            const isSubmitted =
                p.student && filePath;

            const matchesDepartment =
                !departmentFilter || p.department === departmentFilter;

            return isSubmitted && matchesDepartment;
        });
    }, [projects, departmentFilter]);

    console.log(filteredProjects)

    
    /* ================= TABLE COLUMNS ================= */
    const columns = [
        {
            title: "Student Name",
            key: "student",
            render: (_, record) => record.student?.name || "Not Submitted",
        },

        {
            title: "Project Name",
            dataIndex: "projectName",
            key: "projectName",
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
            render: (dept) => <Tag color="blue">{dept}</Tag>,
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
        },
        {
            title: "File",
            key: "file",
            render: (_, record) => {
                const filePath =
                    record.projectFile?.path ||   // if object
                    record.projectFile;           // if string

                if (!filePath) return "No File";

                const fullUrl = filePath;

                return (
                    <a href={fullUrl} target="_blank" rel="noreferrer">
                        View File
                    </a>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) =>
                date ? new Date(date).toLocaleString() : "-",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center mt-20">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">All Projects</h2>

            {/* FILTER */}
            <div className="mb-4">
                <Select
                    placeholder="Filter by Department"
                    allowClear
                    style={{ width: 250 }}
                    onChange={(value) => setDepartmentFilter(value)}
                >
                    {departments.map((dept) => (
                        <Option key={dept} value={dept}>
                            {dept}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* TABLE */}
            <Table
                columns={columns}
                dataSource={filteredProjects}
                rowKey={(record) => record._id}
                bordered
                scroll={{x: 300}}
            />
        </div>
    );
};

export default AssignmentSuperAdmin;