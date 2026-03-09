import { Table, Space, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";

//Redux api
import { useGetUsersQuery, useDeleteUserMutation } from "../redux/userApi";


function AllUsers() {

  const navigate = useNavigate();

  // GET USER FROM REDUX
  const user = useSelector(selectUser);

  const { data, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();


  const users = data?.users || [];


  
  const handleDelete = async (id) => {

    try {
      await deleteUser(id).unwrap();
      message.success("User deleted");
    } catch (error) {
      console.log(error);
      message.error("Delete failed");
    }
  };



  const handleEdit = (record) => {
    navigate("/dashboard/add-user", {
      state: { user: record }
    });
  };



  const columns = [
    {
      title: "Name",
      dataIndex: "name"
    },
    {
      title: "Email",
      dataIndex: "email"
    },
    {
      title: "Role",
      dataIndex: "role"
    },
    {
      title: "Contact",
      dataIndex: "contact"
    },

    ...(user?.role === "staff"
      ? [
          {
            title: "Actions",
            render: (_, record) => (
              <Space>
                <EditOutlined
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => handleEdit(record)}
                />

                <Popconfirm
                  title="Are you sure to delete?"
                  onConfirm={() => handleDelete(record._id)}
                >
                  <DeleteOutlined
                    style={{ color: "red", cursor: "pointer" }}
                  />
                </Popconfirm>
              </Space>
            )
          }
        ]
      : [])
  ];

  
  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users</p>;



  return (
    <div>

      <h2 className="text-xl font-semibold mb-4">
        All Users
      </h2>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        bordered
        scroll={{ x: 600 }}
      />

    </div>
  );
}

export default AllUsers;