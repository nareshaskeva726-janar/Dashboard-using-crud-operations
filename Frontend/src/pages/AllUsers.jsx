import React, { useState } from "react";
import {
  Table,
  Space,
  Popconfirm,
  message,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
} from "../redux/userApi";

/* ================= DEPARTMENT MAP ================= */

const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
  CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
  MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
  CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"],
};

const departments = Object.keys(departmentSubjectsMap);

function AllUsers() {
  const user = useSelector(selectUser);

  const { data, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const users = Array.isArray(data) ? data : [];

  /* ================= DEPARTMENT FILTER ================= */

  const [adminDeptFilter, setAdminDeptFilter] = useState("ALL");
  const [staffDeptFilter, setStaffDeptFilter] = useState("ALL");
  const [studentDeptFilter, setStudentDeptFilter] = useState("ALL");

  const filterByDepartment = (list, dept) => {
    if (dept === "ALL") return list;
    return list.filter((u) => u.department === dept);
  };

  const adminUsers = filterByDepartment(
    users.filter((u) => u.role === "admin"),
    adminDeptFilter
  );

  const staffUsers = filterByDepartment(
    users.filter((u) => u.role === "staff"),
    staffDeptFilter
  );

  const studentUsers = filterByDepartment(
    users.filter((u) => u.role === "student"),
    studentDeptFilter
  );

  /* ================= PERMISSIONS ================= */

  const canModify = (targetUser) => {
    if (user.role === "superadmin") return true;
    if (user.role === "admin")
      return !["admin", "superadmin"].includes(targetUser.role);
    if (user.role === "staff") return targetUser.role === "student";
    return false;
  };

  const handleDelete = async (targetUser) => {
    if (!canModify(targetUser)) return message.error("Access Denied");

    try {
      await deleteUser(targetUser._id).unwrap();
      message.success("User deleted");
    } catch (err) {
      message.error(err?.data?.message || "Delete failed");
    }
  };

  /* ================= MODAL STATE ================= */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [role, setRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [form] = Form.useForm();

  const openModal = (userToEdit = null) => {
    setEditingUser(userToEdit);
    setIsModalOpen(true);

    if (userToEdit) {
      form.setFieldsValue(userToEdit);
      setRole(userToEdit.role);
      setSelectedDepartment(userToEdit.department);
    } else {
      form.resetFields();
      setRole("");
      setSelectedDepartment("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getAllowedRoles = () => {
    if (user.role === "superadmin") return ["admin", "staff", "student"];
    if (user.role === "admin") return ["staff", "student"];
    if (user.role === "staff") return ["student"];
    return [];
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);

    if (role === "student") {
      form.setFieldsValue({
        subjects: departmentSubjectsMap[dept],
      });
    } else {
      form.setFieldsValue({ subjects: [] });
    }
  };

  const onFinish = async (values) => {
    try {
      const payload = { ...values };

      payload.contact = String(payload.contact);

      if (payload.role === "admin") delete payload.subjects;
      if (payload.role === "staff") payload.subjects = [payload.subjects];
      if (payload.role === "student")
        payload.subjects = departmentSubjectsMap[payload.department];

      delete payload.confirmpassword;

      if (editingUser) {
        await updateUser({
          id: editingUser._id,
          data: payload,
        }).unwrap();
        message.success("User Updated Successfully");
      } else {
        await addUser(payload).unwrap();
        message.success("User Created Successfully");
      }

      closeModal();
    } catch (err) {
      message.error(err?.data?.message || "Operation Failed");
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const adminColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    { title: "Contact", dataIndex: "contact" },
  ];

  const staffColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    {
      title: "Subject",
      render: (_, record) => record.subjects?.[0] || "-",
    },
    { title: "Contact", dataIndex: "contact" },
  ];

  const studentColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    { title: "Contact", dataIndex: "contact" },
    {
      title: "Subjects",
      render: (_, record) => record.subjects?.join(", ") || "-",
    },
  ];

  const addActions = (columns) => {
    if (user.role === "student") return;

    columns.push({
      title: "Actions",
      render: (_, record) => (
        <Space>
          <EditOutlined
            style={{ color: "blue" }}
            onClick={() => openModal(record)}
          />
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record)}>
            <DeleteOutlined style={{ color: "red" }} />
          </Popconfirm>
        </Space>
      ),
    });
  };

  addActions(adminColumns);
  addActions(staffColumns);
  addActions(studentColumns);

  /* ================= FILTER DROPDOWN ================= */

  const DepartmentFilter = ({ value, onChange }) => (
    <Select value={value} style={{ width: 170 }} onChange={onChange}>
      <Select.Option value="ALL">All Departments</Select.Option>
      {departments.map((dept) => (
        <Select.Option key={dept} value={dept}>
          {dept}
        </Select.Option>
      ))}
    </Select>
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ALL USERS</h1>

        {(user.role === "superadmin" ||
          user.role === "admin" ||
          user.role === "staff") && (
            <Button type="primary" onClick={() => openModal()}>
              <PlusOutlined /> ADD USER
            </Button>
          )}
      </div>

      {/* ADMIN */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>HOD (Admin)</span>
            <DepartmentFilter
              value={adminDeptFilter}
              onChange={setAdminDeptFilter}
            />
          </div>
        }
      >
        <Table columns={adminColumns} dataSource={adminUsers} rowKey="_id"  scroll={{x: 800}}/>
      </Card>

      {/* STAFF */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Staff</span>
            <DepartmentFilter
              value={staffDeptFilter}
              onChange={setStaffDeptFilter}
            />
          </div>
        }
      >
        <Table columns={staffColumns} dataSource={staffUsers} rowKey="_id" scroll={{x: 800}}/>
      </Card>

      {/* STUDENTS */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Students</span>
            <DepartmentFilter
              value={studentDeptFilter}
              onChange={setStudentDeptFilter}
            />
          </div>
        }
      >
        <Table columns={studentColumns} dataSource={studentUsers} rowKey="_id" scroll={{x: 800}} />
      </Card>

      {/* ================= MODAL ================= */}

      <Modal
        title={editingUser ? "Update User" : "Add User"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>

          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select
              placeholder="Select user role"
              onChange={(value) => {
                setRole(value);
                form.resetFields(["department", "subjects"]);
              }}
            >
              {getAllowedRoles().map((r) => (
                <Select.Option key={r} value={r}>
                  {r.toUpperCase()}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {(role === "admin" || role === "staff" || role === "student") && (
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select department"
                onChange={handleDepartmentChange}
              >
                {departments.map((dept) => (
                  <Select.Option key={dept}>{dept}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {role === "staff" && selectedDepartment && (
            <Form.Item
              label="Subject"
              name="subjects"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select subject">
                {departmentSubjectsMap[selectedDepartment].map((sub) => (
                  <Select.Option key={sub}>{sub}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {role === "student" && selectedDepartment && (
            <Form.Item label="Subjects">
              <Input
                placeholder="Subjects will be auto assigned"
                value={departmentSubjectsMap[selectedDepartment].join(", ")}
                disabled
              />
            </Form.Item>
          )}

          {!editingUser && (
            <>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password placeholder="Enter password (min 6 characters)" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmpassword"
                dependencies={["password"]}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Re-enter password" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Contact"
            name="contact"
            rules={[
              { required: true },
              { pattern: /^[0-9]{10}$/, message: "Enter valid 10 digit number" },
            ]}
          >
            <Input
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
}

export default AllUsers;