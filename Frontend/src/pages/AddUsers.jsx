import { Form, Input, Button, Card, message, Select } from "antd";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";


import { useAddUserMutation, useUpdateUserMutation } from "../redux/userApi";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice"


function AddUsers() {

  
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  // const { user } = useAuth();

  const user = useSelector(selectUser)

  const [addUser, { isLoading: adding }] = useAddUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const editingUser = location.state?.user;


  // ROLE PROTECTION
  useEffect(() => {

    if (user?.role !== "staff") {
      message.error("Access denied");
      navigate("/dashboard/users");
    }


  }, [user, navigate]);



  // AUTO FILL WHEN EDITING
  useEffect(() => {

    if (editingUser) {
      form.setFieldsValue(editingUser);
    }

  }, [editingUser, form]);


  // ADD OR UPDATE USER
  const onFinish = async (values) => {

    try {

      if (editingUser) {

        await updateUser({
          id: editingUser._id,
          data: values
        }).unwrap();

        message.success("User updated successfully");

      } else {

        const payload = {

          name: values.name,
          email: values.email,
          role: values.role,
          password: values.password,
          confirmpassword: values.confirmPassword,
          contact: values.contact

        };

        await addUser(payload).unwrap();

        message.success("User added successfully");

      }

      form.resetFields();

      navigate("/dashboard/users");

    } catch (error) {

      console.log(error);

      message.error("Operation failed");

    }

  };



  return (

    <div className="p-4 flex flex-col">

      <Card
        title={editingUser ? "Update User" : "Add User"}
        className="max-w-md"
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true }]}
          >

            <Select placeholder="Select Role">

              <Select.Option value="staff">
                Staff
              </Select.Option>

              <Select.Option value="student">
                Student
              </Select.Option>

            </Select>

          </Form.Item>


          {/* PASSWORD ONLY WHEN ADDING USER */}

          {!editingUser && (

            <>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>


              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true },
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
                <Input.Password />
              </Form.Item>

            </>

          )}


          <Form.Item
            label="Contact"
            name="contact"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>


          <Button
            type="primary"
            htmlType="submit"
            block
            loading={adding || updating}
          >
            {editingUser ? "Update User" : "Add User"}
          </Button>

        </Form>

      </Card>

    </div>

  );

}

export default AddUsers;