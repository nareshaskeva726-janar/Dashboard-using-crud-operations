import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";

const { Content } = Layout;

function DashBoardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <Layout className="min-h-screen">
      
      {/* Sidebar */}
      <SideBar open={open} setOpen={setOpen} />

      <Layout>
        {/* Navbar */}
        <NavBar setOpen={setOpen} />


        {/* Page Content */}
        <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
          <Outlet />
        </Content>
      </Layout>
      
    </Layout>
  );
}

export default DashBoardLayout;