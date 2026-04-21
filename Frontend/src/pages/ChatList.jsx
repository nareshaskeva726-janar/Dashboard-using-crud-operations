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
          className={`
      px-4 py-2
      text-sm sm:text-base
      break-words
      max-w-[85%] sm:max-w-[70%]
      rounded-2xl shadow-sm
      ${isSender
              ? theme === "dark"
                ? "bg-[#2a2a2a] text-white rounded-br-sm"
                : "bg-gray-900 text-white rounded-br-sm"
              : theme === "dark"
                ? "bg-[#1635ff] text-gray-200 border border-[#303030] rounded-bl-sm"
                : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-sm"
            }
    `}
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
    <Layout className="h-screen bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden rounded-lg">

      <Content className="p-3 sm:p-6 lg:p-8 overflow-y-auto" style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>

        {/* TITLE */}
        <div
          className="mb-6 px-4 py-3 rounded-xl"
          style={{
            background: theme === "dark" ? "#1f1f1f" : "#f5f7fb",
            border:
              theme === "dark"
                ? "1px solid #303030"
                : "1px solid #e5e7eb",
          }}
        >
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ color: theme === "dark" ? "#fff" : "#111827" }}
          >
            Select Users
          </h2>

          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
          >
            Choose two users to begin a conversation
          </p>
        </div>




        {/* ✅ PURE GRID (FIXED HEIGHT CARDS) */}
        <div
          className="
    grid gap-4
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
                className={`
          relative cursor-pointer
          flex flex-col items-center justify-center
          p-6 rounded-2xl
          transition-all duration-300
          select-none
          ${selected ? "scale-[1.02]" : "hover:-translate-y-1"}
        `}
                style={{
                  background: selected
                    ? theme === "dark"
                      ? "#1d4ed8"
                      : "#e0ecff"
                    : theme === "dark"
                      ? "#1f1f1f"
                      : "#ffffff",
                  border: selected
                    ? "1px solid #3b82f6"
                    : theme === "dark"
                      ? "1px solid #303030"
                      : "1px solid #e5e7eb",
                  boxShadow: selected
                    ? "0 6px 20px rgba(59,130,246,0.35)"
                    : "0 3px 12px rgba(0,0,0,0.05)",
                }}
              >
                {/* Selected Indicator */}
                {selected && (
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-400" />
                )}

                {/* Avatar */}
                <Avatar
                  size={56}
                  icon={<UserOutlined />}
                  style={{
                    background: selected
                      ? "#ffffff22"
                      : theme === "dark"
                        ? "#262626"
                        : "#f3f4f6",
                  }}
                  className="mb-4"
                />

                {/* Name */}
                <div
                  className="font-semibold text-center text-sm sm:text-base"
                  style={{
                    color: selected
                      ? "#fff"
                      : theme === "dark"
                        ? "#e5e7eb"
                        : "#111827",
                  }}
                >
                  {u.name}
                </div>

                {/* Role */}
                <div
                  className="text-xs mt-1 text-center"
                  style={{
                    color: selected
                      ? "#dbeafe"
                      : theme === "dark"
                        ? "#9ca3af"
                        : "#6b7280",
                  }}
                >
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