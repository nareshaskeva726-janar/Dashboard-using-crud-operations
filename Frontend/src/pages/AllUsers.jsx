import { Table, Space, Popconfirm, message, Card } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";

// Redux API
import { useGetUsersQuery, useDeleteUserMutation } from "../redux/userApi";




function AllUsers() {

  const navigate = useNavigate();

  const user = useSelector(selectUser);
  // console.log(user);
  // console.log(selectUser, "cscs");

  const { data, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();
  const users = data?.users || [];

  //separate table for both staff and students
  const staffUsers = users.filter(staff => staff.role === "staff");
  const studentUser = users.filter(staff => staff.role === "student");



  // Handle delete user
  const handleDelete = async (id) => {
    try {
      await deleteUser(id).unwrap();
      message.success("User deleted successfully");
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Delete failed");
    }
  };

  // Navigate to edit form
  const handleEdit = (record) => {
    navigate("/dashboard/add-user", { state: { user: record } });
  };

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    {
      title: "Department / Subjects",
      key: "dept_subjects",
      render: (_, record) => {
        if (record.role === "staff") return record.department || "-";
        if (record.role === "student") return record.subjects?.join(", ") || "-";
        return "-";
      },
    },
  ];

  // Add Actions column only for staff users
  if (user?.role === "staff") {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <EditOutlined
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
          >
            <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
          </Popconfirm>
        </Space>
      ),
    });
  }

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div className="p-4">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Staffs</h2>
        <Table
          columns={columns}
          dataSource={staffUsers}
          rowKey="_id"
          bordered
          scroll={{ x: 600 }}
        /></Card>
        <p className="mt-3"></p>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <Table
          columns={columns}
          dataSource={studentUser}
          rowKey="_id"
          bordered
          scroll={{ x: 600 }}
        />
      </Card>
    </div >
  );
}

export default AllUsers;