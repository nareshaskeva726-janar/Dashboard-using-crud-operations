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


    <Layout className="h-[86vh]  rounded-2xl overflow-hidden flex border border-gray-300" style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>

      {/* ================= CHAT LIST ================= */}
      {!activeChatUser && (
        <div className="w-full h-full overflow-y-auto bg-white">
          <div className="sticky top-0 z-10  p-5  text-xl font-bold border-b border-gray-300"
            style={{ color: theme === "dark" ? "#fff" : "#000", background: theme === "dark" ? "#1f1f1f" : "#fff" }}
          >
            Chats
          </div>

          <List
            className={theme === "dark" ? "dark-user-list" : ""}
            dataSource={usersWithLastMessage}
            renderItem={(u) => {
              const active = activeChatUser?._id === u._id;

              return (
                <List.Item
                  onClick={() => handleUserSelect(u)}
                  className={`
          cursor-pointer transition
          ${active ? "active-chat" : "chat-item"}
        `}
                  style={{ border: "none" }}
                >
                  <List.Item.Meta
                    className="p-3"
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <span className={theme === "dark" ? "text-white" : "text-gray-900 font-medium"}>
                        {u.name}
                      </span>
                    }
                    description={
                      <span className={theme === "dark" ? "text-gray-300" : "text-gray-600 text-xs truncate"}>
                        {u.lastMessage || u.role}
                      </span>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      )}




      {/* ================= CHAT SCREEN ================= */}
      {activeChatUser && (
        <Content className="flex flex-col w-full h-full " style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}>

          {/* HEADER */}
          <div className="flex items-center gap-3 p-3  sticky top-0 z-10 border-b border-gray-300" style={{ color: theme === "dark" ? "#fff" : "#000", background: theme === "dark" ? "#1f1f1f" : "#fff" }} >
            <Button
              icon={<ArrowLeftOutlined style={{ color: theme === "dark" ? "#fff" : "#000" }} />}
              onClick={handleBack}
              style={{
                background: theme === "dark" ? "#1f1f1f" : "#fff",
                border: "none",
                outline: "none",
                color: "white",
              }}
            />
            <Avatar icon={<UserOutlined />} />
            <div>
              <div className=" font-semibold" style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                {activeChatUser.name}
              </div>
              <Text style={{ color: "darkgray", fontSize: 12 }}>
                chat
              </Text>
            </div>
          </div>




          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4" style={{ background: theme === "dark" ? "#1f1f1f" : "#fff" }}>
            {messages.map((msg, i) => {
              const isSender = msg.sender?._id === user._id;

              return (
                <div
                  key={msg._id || i}
                  className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div
                    className={`
                      px-4 py-2 max-w-[75%] text-sm break-words shadow
                      ${isSender
                        ? "bg-blue-500 text-white rounded-3xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-3xl rounded-bl-md border border-gray-200"
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




          {/* INPUT */}
          <div className="p-3 flex gap-2 border-t border-gray-300 " style={{ background: theme === "dark" ? "#1f1f1f" : "#fff", color: theme === "dark" ? "#fff" : "#000" }}>


            <Input
              style={{background: theme === "dark" ? "#333" : "#fff", color: theme === "dark" ? "#fff" : "#333", fontWeight: 600}}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={handleSend}
              placeholder="Type a message..."
            />



            <Button
              style={{background: theme === "dark" ? "#333" : "#fff", borderColor: theme === "dark" ? "#fff" : "lightgray"}}
              icon={<SendOutlined 
                style={{color : theme === "dark" ? "#fff" : "#333"}}
                />}
              onClick={handleSend}
            />


          </div>
        </Content>
      )}
      <ToastContainer />
    </Layout>
  );
};

export default ChatBot;