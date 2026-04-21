import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/userApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

function Login() {


  const { theme, toggleTheme } = useTheme();

  

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
      toast.success(res.message);

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
<div
  className="min-h-screen flex items-center justify-center px-4"
  style={{
    background: theme === "dark"
      ? "#222"
      : "#f5f5f5",
  }}
>
  <Card
    className="w-full max-w-md shadow-xl rounded-2xl"
    style={{
      background: theme === "dark" ? "#1f1f1f" : "#fff",
      border: theme === "dark" ? "1px solid #1f2937" : "none",
    }}
    title={
      <span
        style={{
          color: theme === "dark" ? "#fff" : "#000",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Login
      </span>
    }
  >
    <Form layout="vertical" onFinish={handleLogin}>
      
      {/* Email */}
      <Form.Item
        label={
          <span style={{ color: theme === "dark" ? "#d1d5db" : "#000" }}>
            Email
          </span>
        }
        name="email"
        normalize={(value) => value?.trimStart()}
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Enter a valid email" },
        ]}
      >
        <Input
          size="large"
          placeholder="Enter your email"
          style={{
            background: theme === "dark" ? "#1f1f1f" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            border: theme === "dark" ? "1px solid #374151" : "",
          }}
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        label={
          <span style={{ color: theme === "dark" ? "#d1d5db" : "#000" }}>
            Password
          </span>
        }
        name="password"
        normalize={(value) => value?.trimStart()}
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password
          size="large"
          placeholder="Enter your password"
          style={{
            background: theme === "dark" ? "#1f1f1f" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            border: theme === "dark" ? "1px solid #374151" : "",
          }}
        />
      </Form.Item>

      {/* Submit */}
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={isLoading}
        style={{
          marginTop: 20,
          height: 48,
          fontWeight: 600,
          borderRadius: 10,
        }}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </Form>
  </Card>
</div>
  );
}

export default Login;