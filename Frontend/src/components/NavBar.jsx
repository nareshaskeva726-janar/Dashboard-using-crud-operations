import React, { useEffect } from "react";
import {
  Layout,
  Badge,
  Dropdown,
  Tooltip,
  Button,
  Checkbox,
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
import socket from "../socket/socket.js";
import { mergeNotifications, setNotifications } from "../redux/notificationSlice";

import {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
  useMarkSingleNotificationReadMutation,
} from "../redux/notificationApi";

import {
  addNotification,
  markAsRead,
  markAllAsRead,
} from "../redux/notificationSlice";

const { Header } = Layout;

function NavBar({ setOpen }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //  ALWAYS FETCH FROM BACKEND
  const {
    data: notifData,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(undefined, {
    skip: !user?._id,
  });

  const [markNotificationsRead] = useMarkNotificationsReadMutation();
  const [markSingleNotificationReadApi] =
    useMarkSingleNotificationReadMutation();

  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  //  FIX 1: Always sync API → Redux (NO CONDITIONS MISS)
  useEffect(() => {
    if (notifData?.notifications) {
      dispatch(setNotifications(notifData.notifications));
    }
  }, [notifData, dispatch]);

  //  SOCKET (Realtime)
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join_room", user._id);

    const shownNotifications = new Set();

    const handleNotification = (notif) => {
      if (notif.receiver.toString() !== user._id.toString()) return;

      if (shownNotifications.has(notif._id)) return;
      shownNotifications.add(notif._id);

      toast.success(notif.message);

      dispatch(addNotification(notif)); //  ONLY THIS
    };

    const handleOfflineNotifications = (notifs) => {
      if (!Array.isArray(notifs)) return;

      dispatch(mergeNotifications(notifs)); //  IMPORTANT
    };

    socket.on("newNotification", handleNotification);
    socket.on("loadUnreadNotifications", handleOfflineNotifications);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("loadUnreadNotifications", handleOfflineNotifications);
    };
  }, [user?._id, dispatch]);



  //  Logout
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    navigate("/");
  };

  //  MARK ALL READ (DB + UI SYNC)
  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead().unwrap();

      dispatch(markAllAsRead());

      // MUST → persist after refresh
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ MARK SINGLE READ (DB + UI SYNC)
  const handleMarkSingleRead = async (notifId) => {
    try {
      await markSingleNotificationReadApi(notifId).unwrap();

      dispatch(markAsRead(notifId));

      //  MUST → persist after refresh
      refetch();
    } catch (err) {
      console.error(err);
    }
  };



  
  const notificationMenu = (
    <div
      style={{
        width: 320,
        maxHeight: 360,
        overflowY: "auto",
        padding: 10,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          borderBottom: "1px solid #eee",
          paddingBottom: 5,
          fontWeight: 600,
        }}
      >
        <span>Notifications</span>

        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading || isFetching ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : notifications.length === 0 ? (
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
              onChange={() => {
                if (!n.isRead) handleMarkSingleRead(n._id);
              }}
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
        style={{ color: "white", fontSize: 22, cursor: "pointer" }}
        onClick={() => setOpen(true)}
      />

      <div className="navbaricons">
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          dropdownRender={() => notificationMenu}
        >
          <span>
            <Badge 
            style={{marginTop: 2}}
            count={unreadCount}  >
              <BellOutlined style={{ color: "white", fontSize: 20, }} />
            </Badge>
          </span>
        </Dropdown>

        <Tooltip title={user?.email}>
          <UserOutlined style={{ color: "white", fontSize: 20 }} />
        </Tooltip>

        <LogoutOutlined
          style={{ color: "white", fontSize: 20, cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>
    </Header>
  );
}

export default NavBar;