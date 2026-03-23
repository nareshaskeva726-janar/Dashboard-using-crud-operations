import { Form, Input, Button, Card, message, Select } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddUserMutation, useUpdateUserMutation } from "../redux/userApi";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";

function AddUsers() {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [addUser, { isLoading: adding }] = useAddUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const editingUser = location.state?.user;
  const [role, setRole] = useState(editingUser?.role || "");

  // List of all subjects
  const allSubjects = ["Java", "Python", "C", "C++", "DataScience"];

  // ROLE PROTECTION: Only staff can access
  useEffect(() => {
    if (user?.role !== "staff") {
      message.error("Access denied");
      navigate("/dashboard/users");
    }
  }, [user, navigate]);

  // AUTO-FILL FORM WHEN EDITING
  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue(editingUser);
      setRole(editingUser.role);
    }
  }, [editingUser, form]);

  // ADD OR UPDATE USER
  const onFinish = async (values) => {
    try {
      let payload = { ...values };

      if (values.role === "student") {
        // Automatically assign all subjects
        payload.subjects = allSubjects;
        delete payload.department; // remove department for students
      } else {
        delete payload.subjects; // remove subjects for staff
      }

      if (editingUser) {
        // Update existing user
        await updateUser({ id: editingUser._id, data: payload }).unwrap();
        message.success("User updated successfully");
      } else {
        // Add new user
        await addUser(payload).unwrap();
        message.success("User added successfully");
      }

      form.resetFields();
      navigate("/dashboard/users");
    } catch (error) {
      console.error("Add/Update User Error:", error);
      message.error(error?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <Card title={editingUser ? "Update User" : "Add User"} className="w-full max-w-md">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            normalize={(value) => value?.trimStart()}
            rules={[{ required: true, message: "Enter user name" }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Select role" }]}
          >
            <Select placeholder="Select Role" onChange={(value) => setRole(value)}>
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="student">Student</Select.Option>
            </Select>
          </Form.Item>

          {/* Department only for staff */}
          {role === "staff" && (
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: "Select department" }]}
            >
              <Select placeholder="Select Department">
                {allSubjects.map((subj) => (
                  <Select.Option key={subj} value={subj}>
                    {subj}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Password fields only for new users */}
          {!editingUser && (
            <>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter Password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Contact"
            name="contact"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Enter contact number" },
              { pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit number" },
            ]}
          >
            <Input placeholder="Enter Contact Number" maxLength={10} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={adding || updating}>
            {editingUser ? "Update User" : "Add User"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default AddUsers;