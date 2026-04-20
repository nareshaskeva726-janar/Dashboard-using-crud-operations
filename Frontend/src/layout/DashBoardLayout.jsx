import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import { useTheme } from "../context/ThemeContext";

const { Content } = Layout;

function DashBoardLayout() {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <Layout
      style={{
        height: "100%",
        overflow: "hidden",
        background: theme === "dark" ? "#141414" : "#f5f5f5",
      }}
    >
      {/* SIDEBAR */}
      <SideBar open={open} setOpen={setOpen} />

      {/* MAIN AREA */}
      <Layout
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: theme === "dark" ? "#141414" : "#fff",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            flex: "0 0 auto",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: theme === "dark" ? "#1f1f1f" : "#ffffff",
          }}
        >
          <NavBar setOpen={setOpen} />
        </div>

        {/* CONTENT */}
        <Content
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            background: theme === "dark" ? "#141414" : "#f5f5f5",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashBoardLayout;