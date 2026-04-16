import React, { useEffect, useRef } from "react";
import {
  Layout,
  Badge,
  Dropdown,
  Button,
  Checkbox,
  Tooltip,
} from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import socket from "../socket/socket";

import {
  setNotifications,
  addNotification,
  mergeNotifications,
  markAllAsRead,
  markAsRead,
} from "../redux/notificationSlice";

import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkSingleReadMutation,
} from "../redux/notificationApi";

const { Header } = Layout;

function NavBar({ setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const role = user?.role;
  const socketInitialized = useRef(false);

  /* ============================
        RTK QUERY
  ============================ */

  const {
    data: notifData,
    refetch,
  } = useGetNotificationsQuery(undefined, {
    skip: !user?._id,
  });

  const [markAllReadApi] = useMarkAllReadMutation();
  const [markSingleReadApi] = useMarkSingleReadMutation();

  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  /* ============================
        API → REDUX SYNC
  ============================ */

  useEffect(() => {
    if (!notifData?.notifications) return;

    const filtered = notifData.notifications.filter(
      (n) => n.receiverRole === role
    );

    dispatch(setNotifications(filtered));
  }, [notifData, role, dispatch]);

  /* ============================
        SOCKET.IO REALTIME
  ============================ */

  useEffect(() => {
    if (!user?._id || socketInitialized.current) return;

    socketInitialized.current = true;

    if (!socket.connected) socket.connect();

    socket.emit("join_room", user._id);

    const shownIds = new Set();





    /* NEW LIVE NOTIFICATION */
    const handleNotification = (notif) => {
      if (!notif?._id) return;
      if (shownIds.has(notif._id)) return;
      if (notif.receiverRole !== role) return;

      shownIds.add(notif._id);

      toast.success(notif.message || "New Notification");

      dispatch(addNotification(notif));
    };

    /* OFFLINE NOTIFICATIONS */
    const handleOffline = (notifs = []) => {
      const filtered = notifs.filter(
        (n) => n.receiverRole === role
      );

      dispatch(mergeNotifications(filtered));

      filtered.forEach((n) => shownIds.add(n._id));
    };

    socket.on("newNotification", handleNotification);
    socket.on("loadUnreadNotifications", handleOffline);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("loadUnreadNotifications", handleOffline);
    };
  }, [user?._id, role, dispatch]);

  /* ============================
        LOGOUT
  ============================ */




  const handleLogout = () => {
    dispatch(logout());
    socket.disconnect();
    toast.success("Logout successfully");
    navigate("/");
  };




  /* ============================
        MARK ALL READ
  ============================ */



  // const handleMarkAllRead = async () => {
  //   try {
  //     await markAllReadApi().unwrap();
  //     dispatch(markAllAsRead());
  //     refetch();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleMarkAllRead = async () => {
    await markAllReadApi().unwrap();
    dispatch(markAllAsRead());
  };




  /* ============================
        MARK SINGLE READ
  ============================ */


  // const handleSingleRead = async (id) => {
  //   try {
  //     await markSingleReadApi(id).unwrap();
  //     dispatch(markAsRead(id));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleSingleRead = async (id) => {
  await markSingleReadApi(id).unwrap();
  dispatch(markAsRead(id));
};




  /* ============================
        DROPDOWN UI
  ============================ */

  const notificationMenu = (
    <div
      style={{
        width: 320,
        maxHeight: 400,
        overflowY: "auto",
        padding: 12,
        background: "#fff",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        <span>Notifications</span>

        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead}>
            Mark All
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No Notifications
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Checkbox
              checked={n.isRead}
              onChange={() => !n.isRead && handleSingleRead(n._id)}
            />

            <span
              style={{
                fontWeight: n.isRead ? "normal" : "bold",
              }}
            >
              {n.message}
            </span>
          </div>
        ))
      )}
    </div>
  );

  /* ============================
        JSX
  ============================ */

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        background: "#020024",
      }}
    >
      <MenuOutlined
        className="menuBTN"
        style={{
          color: "white",
          fontSize: 22,
          cursor: "pointer",
        }}
        onClick={() => setOpen(true)}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >




        {/* 🔔 Notifications */}
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          dropdownRender={() => notificationMenu}
        >
          <span style={{ cursor: "pointer" }}>
            <Badge count={unreadCount}>
              <BellOutlined
                style={{ color: "white", fontSize: 20 }}
              />
            </Badge>
          </span>
        </Dropdown>

        {/* 👤 User */}
        <Tooltip title={`${user?.name}-(${user?.role})`}>
          <UserOutlined style={{ color: "white", fontSize: 20 }} />
        </Tooltip>

        {/* 🚪 Logout */}
        <LogoutOutlined
          style={{ color: "white", fontSize: 20, cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>
    </Header>
  );
}

export default NavBar;