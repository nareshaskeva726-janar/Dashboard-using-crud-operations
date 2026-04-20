import { Layout, Menu, Drawer } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MessageOutlined,
  ProjectOutlined,
  BookOutlined,
  DashboardOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../redux/authSlice";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext"; // ✅ added

const { Sider } = Layout;

function SideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const { theme } = useTheme(); // ✅ added

  const sidebarColor = theme === "dark" ? "#1f1f1f" : "#ffffff";

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

  const selectedKey = location.pathname.split("/")[2] || "users";

  const menuItems = [
    {
      key: "dashboardpage",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Users",
      hidden: !["superadmin", "admin", "staff", "student"].includes(user?.role),
    },

    ...(user?.role === "superadmin"
      ? [{ key: "attendancesuperadmin", icon: <BookOutlined />, label: "Attendance" }]
      : []),

    ...(user?.role === "admin"
      ? [{ key: "attendanceadmin", icon: <BookOutlined />, label: "Attendance" }]
      : []),

    ...(user?.role === "staff"
      ? [{ key: "attendancestaff", icon: <BookOutlined />, label: "Attendance" }]
      : []),

    ...(user?.role === "student"
      ? [{ key: "attendancestudent", icon: <BookOutlined />, label: "Attendance" }]
      : []),

    ...(user?.role === "student"
      ? [{ key: "assignments", icon: <ProjectOutlined />, label: "Assignments" }]
      : []),

    ...(user?.role === "staff"
      ? [{ key: "assignmentCheck", icon: <ProjectOutlined />, label: "Assignments" }]
      : []),

    ...(user?.role === "superadmin"
      ? [{ key: "assignmnentsuperadmin", icon: <ProjectOutlined />, label: "Assignments" }]
      : []),

    ...(user?.role === "admin"
      ? [{ key: "assignmentadmin", icon: <ProjectOutlined />, label: "Assignments" }]
      : []),

    {
      key: "chat",
      icon: <MessageOutlined />,
      label: "ChatBot",
    },

    ...(user?.role === "superadmin" ||
    user?.role === "admin" ||
    user?.role === "staff"
      ? [
          {
            key: "chathistory",
            icon: <HistoryOutlined />,
            label: "Chat History",
          },
        ]
      : []),

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        className="hidden lg:block min-h-screen"
        style={{
          backgroundColor: sidebarColor,
          border: `1px solid ${theme === "dark" ? "#333" : "#b3cccc"}`,
          borderRadius: "3px",
        }}
      >
        <div className="flex items-center justify-center py-4.5 mb-2">
          <h1
            className="text-xl font-bold"
            style={{ color: theme === "dark" ? "#fff" : "#4d4d4d" }}
          >
            DASHBOARD
          </h1>
        </div>

        <Menu
          theme={theme === "dark" ? "dark" : "light"}
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems.filter((item) => !item.hidden)}
          style={{
            backgroundColor: sidebarColor,
            borderRight: "none",
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
          body: { padding: 0, backgroundColor: sidebarColor },
          header: { backgroundColor: sidebarColor },
        }}
        title={
          <span
            style={{
              color: theme === "dark" ? "#fff" : "#4d4d4d",
              fontWeight: "bold",
            }}
          >
            Dashboard
          </span>
        }
      >
        <Menu
          theme={theme === "dark" ? "dark" : "light"}
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems.filter((item) => !item.hidden)}
          style={{
            backgroundColor: sidebarColor,
          }}
        />
      </Drawer>
    </>
  );
}

export default SideBar;