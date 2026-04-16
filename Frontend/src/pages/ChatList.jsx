import React, { useState, useMemo, useRef, useEffect } from "react";
import { Avatar, Typography, Layout, List, Button } from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useGetConversationQuery } from "../redux/chatApi";
import { useCheckAuthQuery, useGetUsersQuery } from "../redux/userApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { skipToken } from "@reduxjs/toolkit/query";

const { Text } = Typography;
const { Content } = Layout;

const ChatList = () => {
  const chatEndRef = useRef(null);

  /* ================= AUTH ================= */
  const { data: usersData } = useGetUsersQuery();
  const { data: checkAuthData } = useCheckAuthQuery();

  const currentUser = checkAuthData?.user;

  /* ================= FILTER USERS ================= */
  const users = useMemo(() => {
    if (!usersData || !currentUser) return [];
    return usersData.filter((u) => u._id !== currentUser._id);
  }, [usersData, currentUser]);

  /* ================= CHAT STATE ================= */
  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);

  const chatOpen = userA && userB;

  /* ================= CONVERSATION ================= */
  const { data: conversationData } =
    useGetConversationQuery(
      chatOpen
        ? { userA: userA._id, userB: userB._id }
        : skipToken
    );

  const messages = conversationData?.messages ?? [];

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= USER CLICK ================= */
  const handleUserClick = (u) => {
    if (!userA) {
      setUserA(u);
    } else if (!userB && u._id !== userA._id) {
      setUserB(u);
    } else {
      setUserA(u);
      setUserB(null);
    }
  };

  /* ================= MESSAGE UI ================= */
  const renderMessage = (msg) => {
    const isSender =
      msg?.sender?._id?.toString() === userA?._id?.toString();

    return (
      <div
        key={msg._id}
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm
          ${isSender
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white text-blue-900 border border-blue-100 rounded-bl-md"
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
      <Layout className="h-[86vh] bg-blue-50 rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="p-4 bg-white border-b flex items-center gap-3 shadow-sm">
          <Button
            className="bg-blue-100 text-blue-600 border-none"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              setUserA(null);
              setUserB(null);
            }}
          />

          <Avatar className="bg-blue-400" icon={<UserOutlined />} />

          <div>
            <div className="font-semibold text-blue-900">
              {userA.name} & {userB.name}
            </div>
            <Text className="text-blue-500 text-xs">
              Active conversation
            </Text>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map(renderMessage)}
          <div ref={chatEndRef} />
        </div>
      </Layout>
    );
  }

  /* ================= USER SELECTION VIEW ================= */
  return (
    <Layout className="h-[86vh] bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl overflow-hidden">

      <Content className="p-8 overflow-y-auto">

        {/* TITLE */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Select Users
          </h2>
          <p className="text-blue-500 text-sm">
            Click 2 users to start chatting
          </p>
        </div>

        {/* USER CARDS */}
        <List
          grid={{ gutter: 20, column: 4 }}
          dataSource={users}
          renderItem={(u) => {
            const selected =
              userA?._id === u._id || userB?._id === u._id;

            return (
              <List.Item
                onClick={() => handleUserClick(u)}
                className="transition-transform hover:scale-[1.03]"
              >
                <div
                  className={`
                    cursor-pointer p-5 rounded-2xl text-center
                    shadow-md border transition-all duration-200
                    ${selected
                      ? "bg-blue-200 border-blue-400"
                      : "bg-white hover:bg-blue-50 border-blue-100"
                    }
                  `}
                >

                  {/* AVATAR */}
                  <div className="flex justify-center mb-3">
                    <Avatar
                      size={55}
                      className="bg-gradient-to-br from-blue-400 to-blue-600"
                      icon={<UserOutlined />}
                    />
                  </div>

                  {/* NAME */}
                  <div className="font-semibold text-blue-900">
                    {u.name}
                  </div>

                  {/* ROLE */}
                  <div className="text-xs text-blue-500 mt-1">
                    {u.role}
                  </div>

                </div>
              </List.Item>
            );
          }}
        />

      </Content>

      <ToastContainer />
    </Layout>
  );
};

export default ChatList;