import React, { useMemo } from "react";
import { Table, Spin, Tag } from "antd";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import { useGetAllProjectsSuperadminQuery } from "../redux/projectApi";

const AssignmentAdmin = () => {
  const { data, isLoading } = useGetAllProjectsSuperadminQuery();
  const user = useSelector(selectUser);

  const projects = Array.isArray(data?.data) ? data.data : [];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const filePath =
        p.projectFile?.path || p.projectFile;

      const hasFile = Boolean(filePath);

      return (
        p.department === user?.department &&
        hasFile
      );
    });
  }, [projects, user]);

  const columns = [
    {
      title: "Student Name",
      key: "student",
      render: (_, record) => record.student?.name || "Not Submitted",
    },

    {
      title: "Project Name",
      dataIndex: "projectName",
    },
    {
      title: "Department",
      dataIndex: "department",
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "File",
      render: (_, record) => {
        let filePath =
          typeof record.projectFile === "string"
            ? record.projectFile
            : record.projectFile?.path;

        if (!filePath) return "No File";

        return (
          <a
            href={filePath}
            target="_blank"
            rel="noreferrer"
          >
            View File
          </a>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
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
      <h2 className="text-xl font-bold mb-4">
        {user?.department} Department Projects
      </h2>

      {filteredProjects.length === 0 && (
        <div className="text-red-500">
          No projects found for your department
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey={(record) => record._id}
        bordered
        scroll={{ x: 300 }}
      />
    </div>
  );
};

export default AssignmentAdmin;