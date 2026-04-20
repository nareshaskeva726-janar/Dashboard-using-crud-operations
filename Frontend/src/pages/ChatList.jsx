import React, { useState, useMemo, useRef, useEffect } from "react";
import { Avatar, Typography, Layout, Button } from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useGetConversationQuery } from "../redux/chatApi";
import { useCheckAuthQuery, useGetUsersQuery } from "../redux/userApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;
const { Content } = Layout;

const ChatList = () => {

  const { theme, toggleTheme } = useTheme();

  const chatEndRef = useRef(null);

  const { data: usersData } = useGetUsersQuery();
  const { data: checkAuthData } = useCheckAuthQuery();

  const currentUser = checkAuthData?.user;

  const users = useMemo(() => {
    if (!usersData || !currentUser) return [];
    return usersData.filter((u) => u._id !== currentUser._id);
  }, [usersData, currentUser]);

  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);

  const chatOpen = userA && userB;

  const { data: conversationData } = useGetConversationQuery(
    chatOpen ? { userA: userA._id, userB: userB._id } : skipToken
  );

  const messages = conversationData?.messages ?? [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserClick = (u) => {
    if (!userA) setUserA(u);
    else if (!userB && u._id !== userA._id) setUserB(u);
    else {
      setUserA(u);
      setUserB(null);
    }
  };

  const renderMessage = (msg) => {
    const isSender =
      msg?.sender?._id?.toString() === userA?._id?.toString();

    return (
      <div
        key={msg._id}
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`px-4 py-2 rounded-2xl break-words text-sm sm:text-base shadow-sm
          max-w-[85%] sm:max-w-[70%]
          ${isSender
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white text-blue-900 border border-blue-100 rounded-bl-md"
            }`}
        >
          {msg.message}
        </div>
      </div>
    );
  };

  /* ================= CHAT VIEW ================= */
  if (chatOpen) {
    return (
      <Layout
        style={{ background: theme === 'dark' ? "#333" : "#fff" }}
        className="h-full flex flex-col overflow-hidden">


        {/* HEADER */}
        <div className="p-3 sm:p-4  border-b flex items-center gap-3 shadow-sm"
          style={{ background: theme === 'dark' ? "#333" : "#fff" }}
        >
          <Button
            className=" text-blue-600 border-none"
            style={{ background: theme === "dark" ? "#333" : "#fff" }}
            icon={<ArrowLeftOutlined
              style={{ color: theme === "dark" ? "#fff" : "#000" }}
            />}
            onClick={() => {
              setUserA(null);
              setUserB(null);
            }}
          />

          <Avatar className="bg-blue-400" icon={<UserOutlined />} />

          <div className="min-w-0">
            <div className="font-semibold  text-sm sm:text-base truncate"
              style={{ color: theme === "dark" ? "#fff" : "#000" }}
            >
              {userA.name} & {userB.name}
            </div>
            <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>
              Active conversation
            </Text>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {messages.map(renderMessage)}
          <div ref={chatEndRef} />
        </div>
      </Layout>
    );
  }

  /* ================= USER LIST VIEW (GRID FIXED) ================= */
  return (
    <Layout className="h-screen bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">

      <Content className="p-3 sm:p-6 lg:p-8 overflow-y-auto" style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>

        {/* TITLE */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold " style={{ color: theme === "dark" ? "lightblue" : "darkblue" }}>
            Select Users
          </h2>
          <p className="text-blue-500 text-xs sm:text-sm">
            Click 2 users to start chatting
          </p>
        </div>




        {/* ✅ PURE GRID (FIXED HEIGHT CARDS) */}
        <div
          style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}
          className="
            grid gap-3 sm:gap-4
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {users.map((u) => {
            const selected =
              userA?._id === u._id || userB?._id === u._id;

            return (
              <div
                key={u._id}
                onClick={() => handleUserClick(u)}
                style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}
                className={`
                  cursor-pointer
                  h-full
                  flex flex-col justify-center items-center
                  p-4 sm:p-5
                  rounded-2xl
                  border shadow-md
                  transition-all duration-200
                  active:scale-95

                  ${selected
                    ? "bg-blue-200 border-blue-400"
                    : "bg-white hover:bg-blue-50 border-blue-100"
                  }
                `}
              >

                {/* AVATAR */}
                <Avatar
                  size={52}
                  style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}
                  className="  mb-3"
                  icon={<UserOutlined />}
                />

                {/* NAME */}
                <div className="font-semibold text-blue-200 text-sm sm:text-base text-center" style={{ color: theme === "dark" ? "lightblue" : "darkblue" }}>
                  {u.name}
                </div>

                {/* ROLE */}
                <div className="text-xs text-blue-500 mt-1 text-center">
                  {u.role}
                </div>
              </div>
            );
          })}
        </div>
      </Content>

      <ToastContainer />
    </Layout>
  );
};

export default ChatList;