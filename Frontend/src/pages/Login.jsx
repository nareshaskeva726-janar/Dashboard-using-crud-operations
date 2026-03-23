import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (values) => {
    try {
      const payload = {
        email: values.email.trim(),
        password: values.password.trim(),
      };

      const res = await loginUser(payload).unwrap();
      const { token, user } = res;

      if (!token || !user) {
        message.error("Invalid login response");
        return;
      }

      // Save user + token in Redux
      dispatch(loginSuccess({ user, token }));
      message.success(res.message || "Login successful");

      // Navigate based on role
      if (user.role === "staff") {
        navigate("/dashboard/users");
      } else if (user.role === "student") {
        navigate("/dashboard/users");
      } else {
        navigate("/"); // fallback
      }
    } catch (error) {
      console.log("Login Error:", error);
      message.error(error?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card title="Login" className="w-full max-w-md shadow-lg rounded-xl">
        <Form layout="vertical" onFinish={handleLogin}>
          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            normalize={(value) => value?.trimStart()}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            normalize={(value) => value?.trimStart()}
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>

          {/* Register link */}
          <p className="text-gray-500 text-sm mb-3 text-center">
            If you don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold cursor-pointer"
            >
              Register
            </span>
          </p>

          {/* Submit Button */}
          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Login;