import React, { useState, useMemo } from "react";
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
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useBulkWriteUsersMutation
} from "../redux/userApi";

import { toast } from "react-hot-toast"
import { useTheme } from "../context/ThemeContext";
import Papa from "papaparse";

/* ================= DEPARTMENTS ================= */

const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate"],
  EEE: ["Python", "Django", "Flask"],
  CSE: ["C", "DSA", "Algorithms"],
  MECH: ["C++", "OOP"],
  CIVIL: ["Statistics", "ML"],
};

const departments = Object.keys(departmentSubjectsMap);

function AllUsers() {

  const { theme, toggleTheme } = useTheme();

  const fileRef = React.useRef(null);


  const user = useSelector(selectUser);

  const { data = [], isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();



  const [bulkWriteUsers] = useBulkWriteUsersMutation();

  /* ================= TOOLBAR ================= */

  const [showTools, setShowTools] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [importOpen, setImportOpen] = useState(false);

  /* ================= FILTER ================= */

  const filterUsers = (role) =>
    data.filter((u) => {
      const matchRole = u.role === role;

      const matchSearch =
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase());

      const matchDept =
        deptFilter === "ALL" || u.department === deptFilter;

      return matchRole && matchSearch && matchDept;
    });

  const adminUsers = useMemo(
    () => filterUsers("admin"),
    [data, searchText, deptFilter]
  );

  const staffUsers = useMemo(
    () => filterUsers("staff"),
    [data, searchText, deptFilter]
  );

  const studentUsers = useMemo(
    () => filterUsers("student"),
    [data, searchText, deptFilter]
  );

  /* ================= DELETE ================= */

  const handleDelete = async (record) => {
    await deleteUser(record._id);
    message.success("User Deleted");
  };

  /* ================= EXPORT ================= */

  const handleExport = () => {
    const csv = data.map(
      (u) =>
        `${u.name},${u.email},${u.role},${u.department},${u.contact}`
    );

    const blob = new Blob(
      ["Name,Email,Role,Department,Contact\n" + csv.join("\n")],
      { type: "text/csv" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };



  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.loading("Importing users...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async ({ data: imported }) => {
        try {
          const existingEmails = new Set(
            data.map((u) => u.email.toLowerCase())
          );

          const newUsers = imported.filter(
            (u) =>
              u.email &&
              !existingEmails.has(u.email.toLowerCase())
          );

          if (!newUsers.length) {
            toast.dismiss();
            toast.error("No new users found");
            return;
          }

          await bulkWriteUsers(newUsers).unwrap();

          toast.dismiss();
          toast.success(`${newUsers.length} users imported`);

          setImportOpen(false);
        } catch (err) {
          toast.dismiss();
          toast.error("Import failed");
        }
      },
    });
  };

  /* ================= MODAL ================= */

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");

  const [form] = Form.useForm();

  const openModal = (record = null) => {
    setEditingUser(record);
    setOpen(true);

    if (record) {
      form.setFieldsValue(record);
      setRole(record.role);
      setDepartment(record.department);
    } else {
      form.resetFields();
      setRole("");
      setDepartment("");
    }
  };

  const onFinish = async (values) => {
    const payload = { ...values };

    if (payload.role === "staff")
      payload.subjects = [payload.subjects];

    if (payload.role === "student")
      payload.subjects =
        departmentSubjectsMap[payload.department];

    if (editingUser) {
      await updateUser({
        id: editingUser._id,
        data: payload,
      });
      message.success("Updated");
    } else {
      await addUser(payload);
      message.success("Created");
    }

    setOpen(false);
  };

  /* ================= TABLE COLUMNS ================= */

  const baseColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    { title: "Contact", dataIndex: "contact" },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <EditOutlined
            style={{ color: theme === "dark" ? "powderblue" : "blue" }}
            onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete user?"
            onConfirm={() => handleDelete(record)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subjectColumn = {
    title: "Subjects",
    render: (_, r) => r.subjects?.join(", ") || "-",
  };

  const adminColumns = baseColumns;

  const staffColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Department", dataIndex: "department" },
    subjectColumn,
    { title: "Contact", dataIndex: "contact" },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <EditOutlined
            style={{ color: theme === "dark" ? "powderblue" : "blue" }}
            onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete user?"
            onConfirm={() => handleDelete(record)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const studentColumns = staffColumns;

  /* ================= UI ================= */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>


      <h1 className="text-xl sm:text-2xl md:text-3xl p-1 font-semibold">
        ALL USERS
      </h1>


      {/* HEADER */}
      <Row justify="space-between">
        <Button
          style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000", }}
          onClick={() => setShowTools(true)}>
          Open Tools
        </Button>

        <Button
          type="primary"
          style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000", borderColor: theme === "dark" ? "gray" : "#bbb" }}
          icon={<PlusOutlined id="Plus-icon" />}
          onClick={() => openModal()}
        >
          Add User
        </Button>
      </Row>





      {/* TOOLS CARD */}
      {showTools && (
        <Card
          style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000", }}
          bordered={false}

          bodyStyle={{ padding: 16 }}
        >


          <Row align="middle" justify="space-between" gutter={16}>

            {/* LEFT SIDE TOOLS */}
            <Space size="middle" wrap>

              {/* INPUT */}
              <Input
                size="large"
                suffix={<SearchOutlined />}
                placeholder="Search name or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.trimStart())}
                className={theme === "dark" ? "dark-input" : "light-input"}
                style={{
                  width: 420,
                  color: theme === "dark" ? "#fff" : "#000",
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  borderColor: theme === "dark" ? "#333" : "#d9d9d9",
                }}
              />



              {/* SELECT */}
              <Select
                size="large"
                value={deptFilter}
                onChange={setDeptFilter}
                style={{
                  width: 200,
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  borderColor: theme === "dark" ? "#333" : "#d9d9d9"
                }}
                dropdownStyle={{
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                }}
                popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              >


                <Select.Option
                  value="ALL"
                  style={{
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                >
                  All Departments
                </Select.Option>

                {departments.map((d) => (
                  <Select.Option
                    key={d}
                    value={d}
                    style={{
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {d}
                  </Select.Option>
                ))}
              </Select>

              {/* BUTTONS */}




              <Button
                size="large"
                style={{
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  borderColor: theme === "dark" ? "#333" : "#d9d9d9",
                }}
                onClick={() => setImportOpen(true)}
              >
                Import
              </Button>

              <Modal
                title="Bulk Import Users"
                open={importOpen}
                footer={null}
                onCancel={() => setImportOpen(false)}
                className={theme === "dark" ? "dark-modal" : ""}
              >
                <Form
                  layout="vertical"
                  className={theme === "dark" ? "dark-form" : ""}
                >
                  {/* NAME */}
                  <Form.Item label="Name">
                    <Input placeholder="NareshPM" disabled />
                  </Form.Item>

                  {/* EMAIL */}
                  <Form.Item label="Email">
                    <Input placeholder="nareshpm@gmail.com" disabled />
                  </Form.Item>

                  {/* ROLE */}
                  <Form.Item label="Role">
                    <Select
                      className={theme === "dark" ? "dark-select" : "light-select"}
                      disabled placeholder="admin / staff / student">
                      <Select.Option>Admin</Select.Option>
                      <Select.Option>Staff</Select.Option>
                      <Select.Option>Student</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* DEPARTMENT */}
                  <Form.Item label="Department">
                    <Select
                      className={theme === "dark" ? "dark-select" : "light-select"}
                      disabled placeholder="Computer Science">
                      {departments.map((d) => (
                        <Select.Option key={d}>{d}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* SUBJECT */}
                  <Form.Item label="Subject">
                    <Select
                      className={theme === "dark" ? "dark-select" : "light-select"}
                      disabled placeholder="Example Subject">
                      <Select.Option>Subject Example</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* PASSWORD */}
                  <Form.Item label="Password">
                    <Input.Password placeholder="password123" disabled />
                  </Form.Item>

                  {/* CONTACT */}
                  <Form.Item label="Contact">
                    <Input placeholder="9876543210" disabled />
                  </Form.Item>

                  {/* CSV INFO TEXT */}
                  <div
                    style={{
                      marginBottom: 20,
                      padding: 12,
                      borderRadius: 6,
                      background: theme === "dark" ? "#1f1f1f" : "#fafafa",
                      border: "1px dashed #888",
                      fontSize: 13,
                      color: theme === "dark" ? "lightgray" : "darkgray"
                    }}
                  >
                    CSV Columns must be:

                    <br />
                    <b>
                      Name, Email, Role, Department, Subject, Password, Contact
                    </b>
                  </div>

                  {/* FILE INPUT */}
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={handleImport}
                  />

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => fileRef.current.click()}
                  >
                    Upload CSV File
                  </Button>
                </Form>
              </Modal>








              <Button
                size="large"
                style={{
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  borderColor: theme === "dark" ? "#333" : "#d9d9d9",
                }}
                onClick={handleExport}
              >
                Export
              </Button>
            </Space>

            {/* RIGHT SIDE CLOSE ICON */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setShowTools(false)}
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid lightgray",
              }}
            >
              Close
            </Button>

          </Row>
        </Card>
      )}

      {/* ADMIN TABLE */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            Admin
          </span>
        }
      >
        <Table
          scroll={{ x: true }}
          columns={adminColumns}
          dataSource={adminUsers}
          rowKey="_id"
          loading={isLoading}
          className={theme === "dark" ? "dark-table" : ""}
          pagination={{ pageSize: 10 }}
        />
      </Card>






      {/* STAFF TABLE */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            Staff
          </span>
        }
      >
        <Table
          scroll={{ x: true }}
          columns={staffColumns}
          dataSource={staffUsers}
          rowKey="_id"
          className={theme === "dark" ? "dark-table" : ""}
          loading={isLoading}
        />
      </Card>

      {/* STUDENT TABLE */}
      <Card
        className={theme === "dark" ? "dark-card" : ""}
        title={
          <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
            Students
          </span>
        }
      >
        <Table
          scroll={{ x: true }}
          columns={studentColumns}
          dataSource={studentUsers}
          rowKey="_id"
          className={theme === "dark" ? "dark-table" : ""}
          loading={isLoading}
        />
      </Card>




      {/* MODAL */}
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title={editingUser ? "Update User" : "Add User"}
        className={theme === "dark" ? "dark-modal" : ""}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          className={theme === "dark" ? "dark-form" : ""}
        >
          {/* NAME */}
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter full name (e.g. John Doe)" />
          </Form.Item>

          {/* EMAIL */}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter email address (e.g. john@gmail.com)" />
          </Form.Item>

          {/* ROLE */}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select
              style={{ background: theme === "dark" ? "#2a2a2a" : "#fff", borderColor: theme === "dark" ? "#444" : "" }}
              popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              className={theme === "dark" ? "dark-select" : "light-select"}
              placeholder="Select user role"
              onChange={(v) => setRole(v)}
            >
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="student">Student</Select.Option>
            </Select>
          </Form.Item>

          {/* DEPARTMENT */}
          <Form.Item name="department" label="Department">
            <Select
              style={{ background: theme === "dark" ? "#2a2a2a" : "#fff", borderColor: theme === "dark" ? "#444" : "" }}
              popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              className={theme === "dark" ? "dark-select" : "light-select"}
              placeholder="Select department"
              onChange={(d) => setDepartment(d)}
            >
              {departments.map((d) => (
                <Select.Option key={d} value={d}>
                  {d}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* SUBJECTS */}
          {role === "staff" && department && (
            <Form.Item name="subjects" label="Subject">
              <Select placeholder="Select subject">
                {departmentSubjectsMap[department].map((s) => (
                  <Select.Option key={s} value={s}>
                    {s}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* PASSWORD */}
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Enter password" }]}
            >
              <Input.Password
                placeholder="Create a strong password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined style={{ color: "#fff" }} />
                  ) : (
                    <EyeInvisibleOutlined style={{ color: "#fff" }} />
                  )
                }
              />
            </Form.Item>
          )}




          {/* CONTACT */}
          <Form.Item
            name="contact"
            label="Contact"
            rules={[
              { required: true, message: "Enter contact number" },
              { len: 10, message: "Must be 10 digits" },
            ]}
          >
            <Input placeholder="Enter 10-digit mobile number" maxLength={10} />
          </Form.Item>

          {/* SUBMIT */}
          <Button type="primary" htmlType="submit" block>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

export default AllUsers;

