import { Layout, Menu, Drawer } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MessageOutlined,
  ProjectOutlined,
  FileMarkdownOutlined,
  TableOutlined,
  DashboardOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../redux/authSlice";
import { toast } from "react-hot-toast";

const { Sider } = Layout;

function SideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const sidebarColor = "#0d1e44";

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successfully", { position: "top-center", duration: 5000 });
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

  // Build menu items dynamically based on role
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
      // Only visible to superadmin, admin, staff
      hidden: !["superadmin", "admin", "staff", "student"].includes(user?.role),
    },



    ...(user?.role === "student")
      ? [
        {
          key: "assignments", //student
          icon: <ProjectOutlined />,
          label: "Assignments",
        },
      ] : [],


    ...(user?.role === "staff")
      ? [
        {
          key: "assignmentCheck",
          icon: <ProjectOutlined />,
          label: "Assignments",
        },
      ] : [],

    ...(user?.role === "superadmin")
      ? [
        {
          key: "assignmnentsuperadmin",
          icon: <ProjectOutlined />,
          label: "Assignments",
        },
      ] : [],


    ...(user?.role === "admin")
      ? [
        {
          key: "assignmentadmin",
          icon: <ProjectOutlined />,
          label: "Assignments",
        },
      ] : [],

      
    {
      key: "chat",
      icon: <MessageOutlined />,
      label: "ChatBot",
    },
    ...(user?.role === 'superadmin' || user?.role === "admin" || user?.role === "staff") ?
      [{
        key: "chathistory",
        icon: <HistoryOutlined />,
        label: "Chat History",
      },] : [],




    ...(user?.role !== "superadmin") ? [
      {
        key: "timetable",
        icon: <TableOutlined />,
        label: "TimeTable",
      },] : [],
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
        style={{ backgroundColor: sidebarColor }}
      >
        <div className="flex items-center justify-center py-4.5 mb-2">
          <h1 className="text-white text-xl font-bold">Dashboard</h1>
        </div>

        <Menu
          theme="dark"
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
        title={<span className="text-white font-bold">Dashboard</span>}
      >
        <Menu
          theme="dark"
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