// ChatList.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Avatar, Typography, Layout, List } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetConversationQuery } from "../redux/chatApi";
import { useCheckAuthQuery, useGetUsersQuery } from "../redux/userApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { skipToken } from "@reduxjs/toolkit/query";

const { Text } = Typography;
const { Sider, Content } = Layout;

const ChatList = () => {
  const chatEndRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  /* ================= AUTH ================= */
  const { data: usersData } = useGetUsersQuery();
  const { data: checkAuthData } = useCheckAuthQuery();

  const currentUser = checkAuthData?.user;

  /* ================= ROLE FILTER USERS ================= */
  const users = useMemo(() => {
    if (!usersData || !currentUser) return [];

    const { role, department, subjects, _id } = currentUser;

    if (role === "superadmin") {
      return usersData.filter((u) => u._id !== _id);
    }

    if (role === "admin") {
      return usersData.filter(
        (u) => u._id !== _id && u.department === department
      );
    }

    if (role === "staff") {
      return usersData.filter((u) => {
        if (u._id === _id) return false;
        if (u.role !== "student") return false;
        if (u.department !== department) return false;

        return u.subjects?.some((sub) =>
          subjects?.includes(sub)
        );
      });
    }

    if (role === "student") {
      return usersData.filter((u) => u._id !== _id);
    }

    return [];
  }, [usersData, currentUser]);

  /* ================= SELECT USERS ================= */
  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);

  /* ================= FETCH CONVERSATION ================= */
  const { data: conversationData } =
    useGetConversationQuery(
      userA && userB
        ? { userA: userA._id, userB: userB._id }
        : skipToken
    );

  const messages = conversationData?.messages ?? [];

  console.log(messages, "messages")

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (!messages?.length) return;

    if (isFirstLoadRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  /* ================= MESSAGE RENDER ================= */
  const renderMessage = (msg) => {
    // ⭐ IMPORTANT FIX
    // align based on selected UserA (conversation viewer)
    const isSender =
      msg?.sender?._id?.toString() === userA?._id?.toString();

    return (
      <div
        key={msg._id}
        className={`flex ${isSender ? "justify-end" : "justify-start"
          } mb-3`}
      >
        {!isSender && (
          <Avatar
            size={36}
            src={msg.sender?.profilePic}
            icon={<UserOutlined />}
            className="mr-2"
          />
        )}

        <div
          className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${isSender
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
            }`}
        >
          {msg.message}

          {msg.createdAt && (
            <div className="text-[10px] opacity-60 mt-1 text-right">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ================= UI ================= */
  return (
    <Layout className="h-[86vh] rounded-2xl overflow-hidden shadow-2xl">
      {/* SIDEBAR */}
      <Sider width={300} className="bg-[#0f172a] relative">
        <div className="sticky top-0 z-30 p-5 font-bold text-center text-white border-b border-blue-800 bg-[#0f172a]">
          Select Users and view their chat History
        </div>

        <div className="overflow-y-auto h-[calc(86vh-72px)] px-3 pt-4">
          <List
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            dataSource={users}
            renderItem={(u) => {
              const isUserA = userA?._id === u._id;
              const isUserB = userB?._id === u._id;
              const isSelected = isUserA || isUserB;

              return (
                <List.Item
                  key={u._id}
                  onClick={() => {
                    if (isUserA) setUserA(null);
                    else if (isUserB) setUserB(null);
                    else if (!userA) setUserA(u);
                    else if (!userB) setUserB(u);
                    else setUserA(u);
                  }}
                  className={`cursor-pointer px-3 py-2 rounded ${isSelected
                      ? "bg-blue-800"
                      : "hover:bg-blue-950"
                    }`}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={36}
                        icon={<UserOutlined />}
                        className="bg-blue-600 text-white"
                      />
                    }
                    title={
                      <Text style={{ color: "#fff", fontWeight: 700 }}>
                        {u.name}
                      </Text>
                    }
                    description={
                      <Text
                        style={{
                          color: "powderblue",
                          fontWeight: 400,
                        }}
                      >
                        {u.role}
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      </Sider>

      {/* CHAT AREA */}
      <Content className="flex flex-col bg-[#1e293b] relative">
        <div className="sticky top-0 z-20 p-4 bg-[#0f172a] flex items-center gap-3 shadow-sm">
          {userA && userB ? (
            <>
              <Avatar
                size={38}
                icon={<UserOutlined />}
                className="bg-blue-600 text-white"
              />
              <div>
                <div className="font-semibold text-blue-300">
                  Chat between {userA.name} & {userB.name}
                </div>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  Active chat
                </Text>
              </div>
            </>
          ) : (
            <Text style={{ color: "white", fontWeight: 600 }}>
              Select two users to start chat
            </Text>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-1 pb-[90px]">
          {messages.map((msg) => renderMessage(msg))}
          <div ref={chatEndRef} />
        </div>
      </Content>

      <ToastContainer position="top-right" autoClose={3000} />
    </Layout>
  );
};

export default ChatList;


