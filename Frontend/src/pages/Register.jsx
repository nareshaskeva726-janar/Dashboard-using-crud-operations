import { Form, Input, Button, Card, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

import { useRegisterUserMutation } from "../redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

function Register() {

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { login } = useAuth();

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const handleRegister = async (values) => {

    try {

      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        confirmpassword: values.confirmPassword,
        contact: values.contact
      };

      const res = await registerUser(payload).unwrap();

      const { token, user } = res;

      if (!token || !user) {

        message.error("Registration failed");
        return;

      }

      // // Save user + token
      // login(user, token);

      dispatch(loginSuccess({user, token}));

      message.success(res.message || "Registration successful");

      form.resetFields();

      navigate("/dashboard/users");

    } catch (error) {

      console.log("Error in Register:", error);

      message.error(
        error?.data?.message || "Registration failed"
      );

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 sm:px-4 md:px-6 py-6">

      <Card
        title="Register"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-xl"
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
        >

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter valid email" }
            ]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

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

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Enter password" },
              { min: 6, message: "Minimum 6 characters" }
            ]}
          >
            <Input.Password placeholder="Enter password" size="large" />
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

                  return Promise.reject(
                    new Error("Passwords do not match")
                  );

                }
              })
            ]}
          >
            <Input.Password placeholder="Confirm password" size="large" />
          </Form.Item>

          <Form.Item
            label="Contact"
            name="contact"
            rules={[
              { required: true, message: "Enter contact number" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Enter valid 10 digit number"
              }
            ]}
          >
            <Input
              placeholder="Enter contact number"
              maxLength={10}
              size="large"
            />
          </Form.Item>

          <div className="text-center mb-3 text-sm">
            <span className="text-gray-500">
              Already have an Account?
            </span>{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 font-semibold cursor-pointer"
            >
              Login
            </span>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isLoading}
          >
            Register
          </Button>

        </Form>

      </Card>

    </div>

  );

}

export default Register;