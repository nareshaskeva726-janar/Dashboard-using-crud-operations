import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";


const { Content } = Layout;

function DashBoardLayout() {
  
  const [open, setOpen] = useState(false);

  return (
    <Layout className="min-h-screen">
      <SideBar open={open} setOpen={setOpen} />
      <Layout>
        <NavBar setOpen={setOpen} />
        <Content className="p-4 md:p-6 bg-gray-100 min-h-screen">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashBoardLayout;