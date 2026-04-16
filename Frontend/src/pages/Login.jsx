import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import {toast} from "react-hot-toast";

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
      message.success(res.message || "Login successful" , {position: "top-center", duration : 1000});

      // Navigate based on role
      switch (user.role) {
        case "superadmin":
          navigate("/dashboard/dashboardpage"); // Superadmin can manage everything
          break;
        case "admin":
          navigate("/dashboard/dashboardpage"); // Admin can manage staff/student
          break;
        case "staff":
          navigate("/dashboard/dashboardpage"); // Staff can manage students only
          break;
        case "student":
          navigate("/dashboard/dashboardpage"); // Students may just see their info
          break;
        default:
          navigate("/"); // fallback
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error?.data?.message || "Login failed");
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
              { type: "email", message: "Enter a valid email" },
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

          {/* Submit Button */}
          <Button  
          style={{marginTop: "20px"}}
          type="primary" htmlType="submit" block size="large" loading={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Login;