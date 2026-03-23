import { Form, Input, Button, Card, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

function Register() {

  const [form] = Form.useForm();
  const role = Form.useWatch("role", form)


  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const handleRegister = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmpassword: values.confirmPassword,
        contact: values.contact.trim(),
        role: values.role,
        department: values.role === "staff" ? values.department : undefined,
      };

      const res = await registerUser(payload).unwrap();
      const { token, user } = res;

      if (!token || !user) {
        message.error("Registration failed");
        return;
      }

      // Save user + token in Redux
      dispatch(loginSuccess({ user, token }));
      message.success(res.message || "Registration successful");

      form.resetFields();

      // Navigate based on role
      if (user.role === "staff") {
        navigate("/dashboard/users");
      } else {
        navigate("/dashboard/users");
      }
    } catch (error) {
      console.log("Error in Register:", error);
      message.error(error?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 sm:px-4 md:px-6 py-6">
      <Card
        title="Register"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-xl"
      >
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          {/* Name */}
          <Form.Item
            label="Name"
            name="name"
            normalize={(value) => value?.trimStart()}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" size="large" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>



          {/* Role */}
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select Role" size="large">
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="student">Student</Select.Option>
            </Select>
          </Form.Item>




          {/* Department (Staff Only) */}
          {role === "staff" && 
          <Form.Item
            label="Department"
            name="department"
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue("role") === "staff",
                message: "Please select a department",
              }),
            ]}
          >
            <Select
              placeholder="Select Department"
              size="large"
              disabled={form.getFieldValue("role") === "student"}
            >
              <Select.Option value="Java">Java</Select.Option>
              <Select.Option value="Python">Python</Select.Option>
              <Select.Option value="C">C</Select.Option>
              <Select.Option value="C++">C++</Select.Option>
              <Select.Option value="DataScience">DataScience</Select.Option>
            </Select>
          </Form.Item>}

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Enter password" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            normalize={(value) => value?.trimStart()}
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
            <Input.Password placeholder="Confirm password" size="large" />
          </Form.Item>

          {/* Contact */}
          <Form.Item
            label="Contact"
            name="contact"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Enter contact number" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Enter valid 10 digit number",
              },
            ]}
          >
            <Input placeholder="Enter contact number" maxLength={10} size="large" />
          </Form.Item>

          {/* Already have account */}
          <div className="text-center mb-3 text-sm">
            <span className="text-gray-500">Already have an Account?</span>{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 font-semibold cursor-pointer"
            >
              Login
            </span>
          </div>

          {/* Submit Button */}
          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
            Register
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Register;