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
import * as XLSX from "xlsx";
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
  useBulkImportUsersMutation
} from "../redux/userApi";

import { toast } from "react-hot-toast"
import { useTheme } from "../context/ThemeContext";
import Papa from "papaparse";



const departmentSubjectsMap = {
  ESE: ["Core Java", "Spring", "Hibernate", "JSP", "Servlets"],
  EEE: ["Python Basics", "Django", "Flask", "Data Analysis", "Machine Learning"],
  CSE: ["C Basics", "Pointers", "Data Structures", "Algorithms", "File Handling"],
  MECH: ["C++ Basics", "OOP", "STL", "Algorithms", "Templates"],
  CIVIL: ["Python for DS", "Statistics", "Pandas", "NumPy", "Machine Learning"]
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


  const [bulkImportUsers] = useBulkImportUsersMutation();


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




  const handleExport = () => {
    // Prepare data in tabular format
    const worksheetData = data.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.department,
      Contact: u.contact,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Export Excel file
    XLSX.writeFile(workbook, "users.xlsx");
  };

  console.log(handleExport, 'handleExport')


  const handleImport = async (e) => {
    const file = e.target.files?.[0];

    console.log("FILE:", file);

    if (!file) return;

    const fileExt = file.name.split(".").pop().toLowerCase();

    toast.loading("Importing users...");

    try {
      let users = [];

      // ================= CSV =================
      if (fileExt === "csv") {
        users = await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data),
          });
        });
      }

      // ================= EXCEL =================
      else if (fileExt === "xlsx" || fileExt === "xls") {
        const reader = new FileReader();

        users = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const binary = event.target.result;

            const workbook = XLSX.read(binary, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet);

            resolve(jsonData);
          };

          reader.onerror = reject;
          reader.readAsBinaryString(file);
        });
      } else {
        toast.dismiss();
        toast.error("Unsupported file format");
        return;
      }

      const cleanedUsers = users.map((u) => ({
        name: u.name || u.Name,
        email: (u.email || u.Email)?.trim()?.toLowerCase(),
        role: u.role || u.Role,
        department: u.department || u.Department,
        contact: u.contact || u.Contact,
        subjects: u.subjects || u.Subjects
      }));

      console.log(cleanedUsers, "cleanedusers")


      await bulkImportUsers(cleanedUsers).unwrap();

      toast.dismiss();
      toast.success("Users imported successfully");

      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Import failed");
    }
  };

  console.log(handleImport, "handleImport")

  const openFilePicker = () => {
    if (fileRef.current) {
      fileRef.current.value = ""; // IMPORTANT (allows re-upload same file)
      fileRef.current.click();
    }
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>

        <Button
          style={{
            background: theme === "dark" ? "#1f1f1f" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "10px",
            padding: "0 16px",
            height: "38px",
            border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => setShowTools(true)}
        >
          Open Tools
        </Button>

        <Button
          
           style={{
            background: theme === "dark" ? "#1f1f1f" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "10px",
            padding: "0 16px",
            height: "38px",
            border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add User
        </Button>

      </Row>





      {/* TOOLS CARD */}
      {showTools && (
        <Card
          style={{
            background: theme === "dark" ? "#141414" : "#ffffff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "16px",
            boxShadow:
              theme === "dark"
                ? "0 6px 20px rgba(0,0,0,0.6)"
                : "0 6px 16px rgba(0,0,0,0.08)",
            border: "none",
            marginTop: 12,
          }}
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Row align="middle" justify="space-between" gutter={[12, 12]}>

            {/* LEFT SIDE TOOLS */}
            <Space size="middle" wrap align="center">

              {/* SEARCH */}
              <Input
                size="large"
                suffix={<SearchOutlined />}
                placeholder="Search name or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.trimStart())}
                style={{
                  width: 360,
                  borderRadius: "10px",
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
                }}
              />

              {/* SELECT */}
              <Select
                size="large"
                value={deptFilter}
                onChange={setDeptFilter}
                style={{
                  borderRadius: "10px",
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
                }}
                dropdownStyle={{
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                }}
              >
                <Select.Option value="ALL"
                  style={{ color: theme === "dark" ? "#fff" : "#000", background: theme === "dark" ? "#1f1f1f" : "#fff" }}
                >All Departments</Select.Option>

                {departments.map((d) => (
                  <Select.Option key={d} value={d}
                    style={{
                      width: 200,
                      borderRadius: "10px",
                      background: theme === "dark" ? "#1f1f1f" : "#fff",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {d}
                  </Select.Option>
                ))}
              </Select>

              {/* IMPORT */}
              <Button
                size="large"
                style={{
                  borderRadius: "10px",
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
                }}
                onClick={() => setImportOpen(true)}
              >
                Import
              </Button>

              {/* EXPORT */}
              <Button
                size="large"
                style={{
                  borderRadius: "10px",
                  background: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
                }}
                onClick={handleExport}
              >
                Export
              </Button>
            </Space>

            {/* RIGHT SIDE CLOSE */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setShowTools(false)}
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                borderRadius: "10px",
                border: theme === "dark" ? "1px solid #333" : "1px solid #d9d9d9",
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
  style={{
    borderRadius: "16px",
    boxShadow:
      theme === "dark"
        ? "0 6px 20px rgba(0,0,0,0.6)"
        : "0 6px 16px rgba(0,0,0,0.08)",
    border: "none",
  }}
  title={
    <span
      style={{
        color: theme === "dark" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    >
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
    pagination={{
      pageSize: 10,
      position: ["bottomRight"],
    }}
  />
</Card>






      {/* STAFF TABLE */}
  <Card
  className={theme === "dark" ? "dark-card" : ""}
  style={{
    borderRadius: "16px",
    boxShadow:
      theme === "dark"
        ? "0 6px 20px rgba(0,0,0,0.6)"
        : "0 6px 16px rgba(0,0,0,0.08)",
    border: "none",
  }}
  title={
    <span
      style={{
        color: theme === "dark" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    >
      Staff
    </span>
  }
>
  <Table
    scroll={{ x: true }}
    columns={staffColumns}
    dataSource={staffUsers}
    rowKey="_id"
    loading={isLoading}
    className={theme === "dark" ? "dark-table" : ""}
    pagination={{
      pageSize: 10,
      position: ["bottomRight"],
    }}
  />
</Card>

      {/* STUDENT TABLE */}
    <Card
  className={theme === "dark" ? "dark-card" : ""}
  style={{
    borderRadius: "16px",
    boxShadow:
      theme === "dark"
        ? "0 6px 20px rgba(0,0,0,0.6)"
        : "0 6px 16px rgba(0,0,0,0.08)",
    border: "none",
  }}
  title={
    <span
      style={{
        color: theme === "dark" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    >
      Students
    </span>
  }
>
  <Table
    scroll={{ x: true }}
    columns={studentColumns}
    dataSource={studentUsers}
    rowKey="_id"
    loading={isLoading}
    className={theme === "dark" ? "dark-table" : ""}
    pagination={{
      pageSize: 10,
      position: ["bottomRight"],
    }}
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
              placeholder="Select department"
              onChange={(d) => setDepartment(d)}
              style={{
                background: theme === "dark" ? "#2a2a2a" : "#fff",
                borderRadius: 8,
              }}
              popupClassName={theme === "dark" ? "dark-select-dropdown" : ""}
              className={theme === "dark" ? "dark-select" : "light-select"}
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

