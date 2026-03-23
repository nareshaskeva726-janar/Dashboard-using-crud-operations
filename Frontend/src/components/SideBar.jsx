import { Layout, Menu, Drawer } from "antd";
import { UserOutlined, PlusCircleOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, ProjectOutlined, UsergroupAddOutlined, FileMarkdownOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { selectUser, logout } from "../redux/authSlice";

import toast from "react-hot-toast";

const { Sider } = Layout;

function SideBar({ open, setOpen }) {

  //hooks are saving in the variables
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get user safely from redux //this is a usersdata
  const user = useSelector(selectUser);

  const sidebarColor = "#020024"; //color code

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successfully");
    navigate("/");
  };


  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else {
      navigate(`/dashboard/${key}`);
    }
    if (setOpen) setOpen(false);
  };

  // Safe selected key
  const selectedKey = location.pathname.split("/")[2] || "users";


  const menuItems = [
    {
      key: "users",
      icon: <UserOutlined />,
      label: "All Users"
    },


    //DESTRUCTING THE USER BECAUSE WE CAN ADD ALSO
    ...(user?.role === "staff"
      ? [
        {
          key: "add-user",
          icon: <PlusCircleOutlined />,
          label: "Add User"
        }
      ]
      : []),

    {
      key: "chat",
      icon: <MessageOutlined />,
      label: "ChatBot",
    },


    ...(user?.role === "student"
      ? [
        {
          key: "assignments",
          icon: <ProjectOutlined />,
          label: "Assignments",
        }] : [
        {
          key: "assignmentCheck",
          icon: <ProjectOutlined />,
          label: "Assignment Check"
        }
      ]),

      ...(user?.role === "staff" ? [  
    {
      key: "attendancestaff",
      icon: <FileMarkdownOutlined />,
      label: "Attendance"
    }] : [,
    {
      key: "attendance",
      icon: <FileMarkdownOutlined />,
      label: "Attendance"
    }]),

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings"
    },


    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout"
    }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        className="hidden lg:block min-h-screen"
        style={{ backgroundColor: sidebarColor }}
      >
        <div className="flex items-center justify-center py-4.5 mb-2 ">
          <h1 className="text-white text-xl font-bold">Dashboard</h1>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            backgroundColor: sidebarColor,
            borderRight: "none"
          }}
        />
      </Sider>

      {/* MOBILE DRAWER */}
      <Drawer
        placement="left"
        size={250}
        open={open}
        closable={false}
        onClose={() => setOpen(false)}
        styles={{
          body: {
            padding: 0,
            backgroundColor: sidebarColor
          },
          header: {
            backgroundColor: sidebarColor
          }
        }}
        title={<span className="text-white font-bold">Dashboard</span>}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            backgroundColor: sidebarColor
          }}
        />
      </Drawer>
    </>
  );
}

export default SideBar;