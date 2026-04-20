import React, { useEffect, useRef } from "react";
import { Layout, Badge, Dropdown, Button, Checkbox, Tooltip } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import { useTheme } from "../context/ThemeContext";
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
  
  const { theme, toggleTheme } = useTheme();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const role = user?.role;
  const socketInitialized = useRef(false);

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    skip: !user?._id,
  });

  const [markAllReadApi] = useMarkAllReadMutation();
  const [markSingleReadApi] = useMarkSingleReadMutation();

  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  /* ================= API SYNC ================= */
  useEffect(() => {
    if (!notifData?.notifications) return;

    const filtered = notifData.notifications.filter(
      (n) => n.receiverRole === role
    );

    dispatch(setNotifications(filtered));
  }, [notifData, role, dispatch]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!user?._id || socketInitialized.current) return;

    socketInitialized.current = true;

    if (!socket.connected) socket.connect();

    socket.emit("join_room", user._id);

    const shownIds = new Set();

    const handleNotification = (notif) => {
      if (!notif?._id) return;
      if (shownIds.has(notif._id)) return;
      if (notif.receiverRole !== role) return;

      shownIds.add(notif._id);
      toast.success(notif.message || "New Notification");
      dispatch(addNotification(notif));
    };

    const handleOffline = (notifs = []) => {
      const filtered = notifs.filter((n) => n.receiverRole === role);
      dispatch(mergeNotifications(filtered));
    };

    socket.on("newNotification", handleNotification);
    socket.on("loadUnreadNotifications", handleOffline);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("loadUnreadNotifications", handleOffline);
    };
  }, [user?._id, role, dispatch]);

  /* ================= ACTIONS ================= */
  const handleLogout = () => {
    dispatch(logout());
    socket.disconnect();
    toast.success("Logout successfully");
    navigate("/");
  };

  const handleMarkAllRead = async () => {
    await markAllReadApi().unwrap();
    dispatch(markAllAsRead());
  };

  const handleSingleRead = async (id) => {
    await markSingleReadApi(id).unwrap();
    dispatch(markAsRead(id));
  };

  /* ================= NOTIFICATION UI ================= */
  const notificationMenu = (
    <div
      style={{
        width: 320,
        maxHeight: 400,
        overflowY: "auto",
        padding: 12,
        background: theme === "dark" ? "#1f1f1f" : "#fff",
        borderRadius: 10,
        color: theme === "dark" ? "#fff" : "#000",
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
        <p style={{ textAlign: "center", opacity: 0.6 }}>
          No Notifications
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            style={{
              padding: "8px 0",
              borderBottom: `1px solid ${theme === "dark" ? "#333" : "#eee"}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Checkbox
              checked={n.isRead}
              onChange={() => !n.isRead && handleSingleRead(n._id)}
            />
            <span style={{ fontWeight: n.isRead ? "normal" : "bold" }}>
              {n.message}
            </span>
          </div>
        ))
      )}
    </div>
  );

  /* ================= UI ================= */
  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        background: theme === "dark" ? "#1f1f1f" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        borderBottom: `1px solid ${theme === "dark" ? "#333" : "#b3cccc"}`,
        height: 64,
      }}
    >
      {/* MENU */}
      <MenuOutlined
        className="menuBTN"
        style={{
          color: theme === "dark" ? "#fff" : "#000",
          fontSize: 22,
          cursor: "pointer",
        }}
        onClick={() => setOpen(true)}
      />

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

        {/* THEME TOGGLE */}
        <div
          onClick={toggleTheme}
          style={{
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
          }}
        >
          {theme === "dark" ? (
            <SunOutlined style={{ color: "#fff" }} />
          ) : (
            <MoonOutlined style={{ color: "#000" }} />
          )}
        </div>

        {/* NOTIFICATIONS */}
        <Dropdown trigger={["click"]} 
        placement="topCenter"
        dropdownRender={() => notificationMenu}>
          <Badge count={unreadCount}>
            <BellOutlined
            
        
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                fontSize: 20,
                cursor: "pointer",
              }}
            />
          </Badge>
        </Dropdown>

        {/* USER */}
        <Tooltip title={`${user?.name} - ${user?.role}`}>
          <UserOutlined
            style={{
              color: theme === "dark" ? "#fff" : "#000",
              fontSize: 20,
            }}
          />
        </Tooltip>

        {/* LOGOUT */}
        <LogoutOutlined
          onClick={handleLogout}
          style={{
            color: theme === "dark" ? "#fff" : "#000",
            fontSize: 20,
            cursor: "pointer",
          }}
        />
      </div>
    </Header>
  );
}

export default NavBar;