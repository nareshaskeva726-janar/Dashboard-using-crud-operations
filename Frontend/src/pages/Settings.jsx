import { Card, Form, Input, Button, message } from "antd";
import { useState } from "react";
import { CloseOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

import { useResetPasswordMutation } from "../redux/userApi";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";



function Settings() {

  const { theme, toggleTheme } = useTheme();

  const [showForm, setShowForm] = useState(false);
  const [form] = Form.useForm();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const updatePassword = async (values) => {

    try {

      const payload = {
        email: user.email,
        newPassword: values.newPassword
      };

      const res = await resetPassword(payload).unwrap();

      toast.success(res.message || "Password Updated", {
        position: "top-center",
        duration: 5000,
      });

      form.resetFields();
      setShowForm(false);

    } catch (error) {

      message.error(
        error?.data?.message || "Password update failed"
      );

    }

  };

  return (

    <div className="flex justify-center px-4 py-6">

      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* USER DETAILS */}

        <Card
          title={
            <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
              User Details
            </span>
          }



          className="w-full shadow-sm" style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>

          <div className="space-y-2 text-sm md:text-base">
            <p style={{ color: theme === "dark" ? "#fff" : "#000" }} ><b>Name :</b> {user.name}</p>
            <p className="break-all" style={{ color: theme === "dark" ? "#fff" : "#000" }}><b>Email :</b> {user.email}</p>
          </div>

          {!showForm && (

            <p
              className="text-blue-700 text-right font-medium cursor-pointer mt-4"
              onClick={() => setShowForm(true)}
            >
              Forgot Password?
            </p>

          )}

        </Card>

        {/* RESET PASSWORD */}

        {showForm && (

          <Card
            style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}
            title={
              <span style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                Reset Password
              </span>
            } className="w-full shadow-sm">

            <Form
              style={{ color: theme === "dark" ? "#fff" : "#000" }}
              form={form}
              layout="vertical"
              onFinish={updatePassword}
              className={theme === "dark" ? "dark-form" : ""}
            >

              <Form.Item
                style={{ color: theme === "dark" ? "#fff" : "#000" }}
                label="New Password"
                name="newPassword"
                normalize={(value) => value.replace(/^\s+/, "")}
                rules={[
                  { required: true, message: "Enter new password" },
                  { min: 6, message: "Minimum 6 characters" }
                ]}
              >
                 <Input.Password
                  placeholder="New password"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined style={{ color: "#fff" }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ color: "#fff" }} />
                    )
                  }
                />
              </Form.Item>




              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                normalize={(value) => value.replace(/^\s+/, "")}
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm password"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined style={{ color: "#fff" }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ color: "#fff" }} />
                    )
                  }
                />
              </Form.Item>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="w-full sm:w-auto mt-2"
                >
                  Update Password
                </Button>

                <Button
                  style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto "
                >
                  <CloseOutlined />
                </Button>

              </div>

            </Form>

          </Card>

        )}

      </div>

    </div>

  );

}

export default Settings;