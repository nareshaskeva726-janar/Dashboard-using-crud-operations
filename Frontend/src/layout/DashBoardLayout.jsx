import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import {
  useGetCronNotifyQuery,
  useMarkAllasReadMutation,
} from "../redux/cronApi";

const { Content } = Layout;

function DashBoardLayout() {
  const [open, setOpen] = useState(false);

  const { data, isSuccess } = useGetCronNotifyQuery(undefined, {
    pollingInterval: 60000,
  });

  const [markAllReminders] = useMarkAllasReadMutation();

  const toastShown = useRef(false);

  useEffect(() => {
    if (!isSuccess || !data?.length) return;

    if (toastShown.current) return;

    data.forEach((item) => {
      toast.success(item.message);
    });

    markAllReminders();

    toastShown.current = true;
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