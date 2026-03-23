import { Card, Form, Input, Button, message } from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";

import { useResetPasswordMutation } from "../redux/userApi";



function Settings() {

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

      message.success(res.message || "Password Updated");

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

        <Card title="User Details" className="w-full shadow-sm">

          <div className="space-y-2 text-sm md:text-base">
            <p><b>Name :</b> {user.name}</p>
            <p className="break-all"><b>Email :</b> {user.email}</p>
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

          <Card title="Reset Password" className="w-full shadow-sm">

            <Form
              form={form}
              layout="vertical"
              onFinish={updatePassword}
            >

              <Form.Item
                label="New Password"
                name="newPassword"
                normalize={(value) => value.replace(/^\s+/, "")}
                rules={[
                  { required: true, message: "Enter new password" },
                  { min: 6, message: "Minimum 6 characters" }
                ]}
              >
                <Input.Password placeholder="Enter new password" />
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

                      return Promise.reject(
                        new Error("Passwords do not match")
                      );

                    }
                  })
                ]}
              >
                <Input.Password placeholder="Confirm password" />
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