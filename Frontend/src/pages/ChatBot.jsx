import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, List, Avatar, Input, Button, Spin, Typography, Card } from "antd";
import {
  UserOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { selectUser } from "../redux/authSlice";
import { useGetUsersQuery } from "../redux/userApi";
import { useGetConversationQuery } from "../redux/chatApi";
import { setMessages, addMessage, setActiveChatUser } from "../redux/chatSlice";
import { skipToken } from "@reduxjs/toolkit/query";

import socket from "../socket/socket";
import { useTheme } from "../context/ThemeContext";

const { Content } = Layout;
const { Text } = Typography;

const ChatBot = () => {


  const { theme, toggleTheme } = useTheme();


  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { messages, activeChatUser } = useSelector((state) => state.chat);

  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* USERS */
  const { data: usersData, isLoading } = useGetUsersQuery();
  const users = usersData?.filter((u) => u._id !== user?._id) || [];

  const handleUserSelect = (selectedUser) => {
    dispatch(setActiveChatUser(selectedUser));
    dispatch(setMessages([]));
  };

  const handleBack = () => {
    dispatch(setActiveChatUser(null));
    dispatch(setMessages([]));
  };

  /* CONVERSATION */
  const { data: conversationData } = useGetConversationQuery(
    user && activeChatUser
      ? { userA: user._id, userB: activeChatUser._id }
      : skipToken
  );

  useEffect(() => {
    if (conversationData?.messages) {
      dispatch(setMessages({ messages: conversationData.messages }));
    }
  }, [conversationData, dispatch]);

  /* SOCKET */
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join_room", user._id);

    const handleReceiveMessage = (msg) => {
      const exists = messagesRef.current.some((m) => m._id === msg._id);

      if (!exists) {
        dispatch(addMessage(msg));

        if (msg.sender?._id !== user._id) {
          toast.info(
            `New message from ${msg.sender?.name} : ${msg.message}`,
            { position: "top-center", autoClose: 3000 }
          );
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [user?._id, dispatch]);

  /* SEND */
  const handleSend = () => {
    if (!message.trim() || !activeChatUser) return;

    socket.emit("send_message", {
      senderId: user._id,
      receiverId: activeChatUser._id,
      message: message.trim(),
    });

    setMessage("");
  };

  /* SCROLL */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  /* LAST MESSAGE */
  const usersWithLastMessage = useMemo(() => {
    const map = {};

    messages.forEach((msg) => {
      const other =
        msg.sender?._id === user._id ? msg.receiver?._id : msg.sender?._id;

      if (
        !map[other] ||
        new Date(msg.createdAt) > new Date(map[other].createdAt)
      ) {
        map[other] = msg;
      }
    });

    return users.map((u) => ({
      ...u,
      lastMessage: map[u._id]?.message || "",
    }));
  }, [users, messages, user._id]);

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  return (


    <Layout
      className="h-[86vh] flex overflow-hidden rounded-2xl"
      style={{
        background: theme === "dark" ? "#141414" : "#ffffff",
        border:
          theme === "dark"
            ? "1px solid #2a2a2a"
            : "1px solid #e5e7eb",
        boxShadow:
          theme === "dark"
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >

      {/* ================= CHAT LIST ================= */}
      {!activeChatUser && (
        <div
          className="w-full h-full flex flex-col"
          style={{
            background: theme === "dark" ? "#141414" : "#f5f7fb",
          }}
        >
          {/* HEADER */}
          <div
            className="sticky top-0 z-10 px-6 py-4 text-lg font-semibold border-b"
            style={{
              color: theme === "dark" ? "#fff" : "#111",
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              borderColor: theme === "dark" ? "#303030" : "#e5e7eb",
            }}
          >
            Chats
          </div>

          {/* USER LIST */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <List
              dataSource={usersWithLastMessage}
              renderItem={(u) => {
                const active = activeChatUser?._id === u._id;

                return (
                  <List.Item
                    onClick={() => handleUserSelect(u)}
                    className="border-none p-0"
                  >
                    <div
                      className={`
                  flex items-center gap-4 w-full p-3 rounded-xl
                  transition-all duration-200 cursor-pointer
                  ${active
                          ? "bg-blue-500 text-white shadow-md"
                          : theme === "dark"
                            ? "hover:bg-[#262626]"
                            : "hover:bg-gray-100"
                        }
                `}
                    >
                      {/* Avatar */}
                      <Avatar
                        size={44}
                        icon={<UserOutlined />}
                        className="flex-shrink-0"
                      />

                      {/* Name + Message */}
                      <div className="flex flex-col overflow-hidden w-full">
                        <span
                          className={`font-semibold truncate ${active
                            ? "text-white"
                            : theme === "dark"
                              ? "text-gray-200"
                              : "text-gray-900"
                            }`}
                        >
                          {u.name}
                        </span>

                        <span
                          className={`text-sm truncate ${active
                            ? "text-gray-200"
                            : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                            }`}
                        >
                          {u.lastMessage || u.role}
                        </span>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      )}




      {/* ================= CHAT SCREEN ================= */}
      {activeChatUser && (
        <Content
          className="flex flex-col w-full h-full"
          style={{
            background: theme === "dark" ? "#0f0f0f" : "#f5f7fb",
          }}
        >
          {/* ================= HEADER ================= */}
          <div
            className="flex items-center gap-4 px-5 py-3 sticky top-0 z-10 shadow-sm"
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderBottom:
                theme === "dark"
                  ? "1px solid #303030"
                  : "1px solid #e5e7eb",
            }}
          >
            <Button
              icon={
                <ArrowLeftOutlined
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                />
              }
              onClick={handleBack}
              type="text"
            />

            <Avatar size={42} icon={<UserOutlined />} />

            <div className="flex flex-col">
              <span
                className="font-semibold"
                style={{ color: theme === "dark" ? "#fff" : "#111" }}
              >
                {activeChatUser.name}
              </span>

              <span className="text-xs text-green-500">
                Online
              </span>
            </div>
          </div>

          {/* ================= MESSAGES ================= */}
          <div
            className="flex-1 overflow-y-auto px-6 py-5 space-y-3"
            style={{
              background:
                theme === "dark"
                  ? "#141414"
                  : "#eef1f5",
            }}
          >
            {messages.map((msg, i) => {
              const isSender = msg.sender?._id === user._id;

              return (
                <div
                  key={msg._id || i}
                  className={`flex ${isSender ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`
                px-4 py-2 max-w-[70%] text-sm break-words
                shadow-md transition-all
                ${isSender
                        ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
                        : theme === "dark"
                          ? "bg-[#262626] text-gray-200 rounded-2xl rounded-bl-sm"
                          : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"
                      }
              `}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}

            <div ref={chatEndRef} />
          </div>

          {/* ================= INPUT ================= */}
          <div
            className="px-5 py-4"
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              borderTop:
                theme === "dark"
                  ? "1px solid #303030"
                  : "1px solid #e5e7eb",
            }}
          >
            <div
              className="flex items-center gap-3 p-2 rounded-full shadow-sm"
              style={{
                background: theme === "dark" ? "#262626" : "#f1f3f6",
              }}
            >
              <Input
                bordered={false}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Type a message..."
                style={{
                  background: "transparent",
                  color: theme === "dark" ? "#fff" : "#111",
                }}
              />

              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
              />
            </div>
          </div>
        </Content>
      )}
      <ToastContainer />
    </Layout>
  );
};

export default ChatBot;