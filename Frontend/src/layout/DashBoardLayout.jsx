import { Layout, Button } from "antd";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import { useGetCronNotifyQuery } from "../redux/cronApi";

const { Content } = Layout;

function DashBoardLayout() {
  const [open, setOpen] = useState(false);


  
  // ✅ Polling API every 60 seconds
  const { data, isSuccess, refetch } = useGetCronNotifyQuery(undefined, {
    pollingInterval: 60000
  });

  // ✅ Prevent duplicate toasts
  const shownMessages = useRef(new Set());

  useEffect(() => {
    if (!isSuccess || !data?.length) return;

    const stored = JSON.parse(localStorage.getItem("shownReminders")) || [];

    data.forEach((item) => {
      if (!shownMessages.current.has(item._id) && !stored.includes(item._id)) {
        toast.success(item.message);
        shownMessages.current.add(item._id);
        stored.push(item._id);
      }
    });

    localStorage.setItem("shownReminders", JSON.stringify(stored));
  }, [isSuccess, data]);

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