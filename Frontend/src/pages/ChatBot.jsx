import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, List, Avatar, Input, Button, Spin, Typography } from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { selectUser } from "../redux/authSlice";
import { useGetUsersQuery } from "../redux/userApi";
import { useGetConversationQuery } from "../redux/chatApi";
import { setMessages, addMessage, setActiveChatUser } from "../redux/chatSlice";
import { skipToken } from "@reduxjs/toolkit/query";

import socket from "../socket/socket";

const { Sider, Content } = Layout;
const { Text } = Typography;

const ChatBot = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);

  const { messages, activeChatUser } = useSelector((state) => state.chat);

  const [message, setMessage] = useState("");

  const chatEndRef = useRef(null);

  // ✅ FIX 1: keep latest messages for socket (avoid stale closure)
  const messagesRef = useRef([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ================= USERS ================= */
  const { data: usersData, isLoading } = useGetUsersQuery();

  const users = usersData?.filter((u) => u._id !== user?._id) || [];

  const handleUserSelect = (selectedUser) => {
    dispatch(setActiveChatUser(selectedUser));
    dispatch(setMessages([]));
  };

  /* ================= LOAD CONVERSATION ================= */
  const { data: conversationData } = useGetConversationQuery(
    user && activeChatUser
      ? {
        userA: user._id,
        userB: activeChatUser._id,
      }
      : skipToken
  );

  console.log(conversationData, "conversation Data Naresh")

  useEffect(() => {
    if (conversationData?.messages) {
      dispatch(setMessages({ messages: conversationData?.messages }));
    }
  }, [conversationData]);

  console.log(conversationData, "conversation data 2")

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join_room", user._id);

    const handleReceiveMessage = (msg) => {
      const exists = messagesRef.current.some((m) => {
        const mId = m._id;
        const msgId = msg._id;

        return (
          mId === msgId ||
          (
            m.message === msg.message &&
            m.sender?._id === msg.sender?._id &&
            Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000
          )
        );
      });

      if (!exists) {
        dispatch(addMessage(msg));

        if (msg.sender?._id !== user._id) {
          toast.info(
            `New message from ${msg.sender?.name} : ${msg.message}`,
            {
              position: "top-center",
              autoClose: 3000,
            }
          );
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [user?._id, dispatch]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = () => {
    if (!message.trim() || !activeChatUser) return;

    const newMsg = {
      senderId: user._id,
      receiverId: activeChatUser._id,
      message: message.trim(),
    };

    socket.emit("send_message", newMsg);

    setMessage("");
  };

  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!messages?.length) return;

    if (isFirstLoadRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  /* ================= LAST MESSAGE PER USER ================= */
  const usersWithLastMessage = useMemo(() => {
    const lastMessagesMap = {};

    messages.forEach((msg) => {
      const otherUserId =
        msg.sender?._id === user._id ? msg.receiver?._id : msg.sender?._id;

      if (
        !lastMessagesMap[otherUserId] ||
        new Date(msg.createdAt) > new Date(lastMessagesMap[otherUserId].createdAt)
      ) {
        lastMessagesMap[otherUserId] = msg;
      }
    });

    return users.map((u) => ({
      ...u,
      lastMessage: lastMessagesMap[u._id]?.message || "",
      lastMessageTime: lastMessagesMap[u._id]?.createdAt || null,
    }));
  }, [users, messages, user._id]);

  if (isLoading)
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );

  /* ================= UI (UNCHANGED) ================= */
  return (
    <Layout className="h-[86vh] rounded-2xl overflow-hidden shadow-2xl">

      {/* SIDEBAR */}
      <Sider width={280} className="bg-[#0f172a] relative">
        <div className="absolute top-0 left-0 w-full z-10 p-5 font-bold text-center text-white border-b border-blue-800 bg-[#0f172a]">
          Chats
        </div>

        <div className="overflow-y-auto h-[calc(86vh-72px)] pt-20">
          {usersWithLastMessage.length === 0 ? (
            <div className="text-white p-5">No users available</div>
          ) : (
            <List
              dataSource={usersWithLastMessage}
              renderItem={(u) => {
                const active = activeChatUser?._id === u._id;

                return (
                  <List.Item
                    key={u._id}
                    onClick={() => handleUserSelect(u)}
                    className={`cursor-pointer px-5 py-3 transition ${active ? "bg-blue-600" : "hover:bg-blue-950"
                      }`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={42}
                          icon={<UserOutlined />}
                          className={
                            active
                              ? "bg-blue-400 text-white"
                              : "bg-white text-blue-700"
                          }
                        />
                      }
                      title={<span className="text-white font-medium">{u.name}</span>}
                      description={
                        <span className="text-blue-200 text-xs font-semibold truncate">
                          {u.lastMessage || u.role}
                        </span>
                      }
                    />
                    {u.lastMessageTime && (
                      <span className="text-gray-400 text-[10px]">
                        {new Date(u.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Sider>

      {/* CHAT AREA */}
      <Content className="flex flex-col bg-[#1e293b] relative">

        {/* HEADER */}
        <div className="p-4 bg-[#0f172a] flex items-center gap-3 shadow-sm">
          {activeChatUser ? (
            <>
              <Avatar size={38} icon={<UserOutlined />} className="bg-blue-600 text-white" />
              <div>
                <div className="font-semibold text-blue-300">
                  {activeChatUser.name}
                </div>
                <Text style={{ color: "#fff", fontSize: 12 }}>Active chat</Text>
              </div>
            </>
          ) : (
            <Text style={{ color: "#fff" }}>Select a user</Text>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-1 pb-[90px]">
          {!activeChatUser ? (
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                paddingTop: "20%",
                color: "#cbd5e1",
              }}
            >
              Please select a user to start chat, {user?.name}!
            </Text>
          ) : (
            <>
              {messages.map((msg, index) => {
                const senderId = msg.sender?._id || msg.senderId;
                const isSender = senderId?.toString() === user?._id?.toString();

                const nextMsg = messages[index + 1];
                const isLastInGroup =
                  !nextMsg || nextMsg.sender?._id !== senderId;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${isSender ? "justify-end" : "justify-start"
                      } mb-1`}
                  >
                    <div
                      className={`px-4 py-2 text-sm shadow-md max-w-[65%] break-words
                        ${isSender
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                        }
                        ${isSender
                          ? isLastInGroup
                            ? "rounded-br-2xl rounded-tl-2xl rounded-tr-2xl"
                            : "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : isLastInGroup
                            ? "rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl"
                            : "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                        }
                      `}
                    >
                      {msg.message}

                      {isLastInGroup && msg.createdAt && (
                        <div className="text-[10px] opacity-60 text-right mt-1">
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
              })}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* INPUT (UNCHANGED UI) */}

        {activeChatUser && (
          <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0f172a] flex gap-3">
            <Input
              size="large"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={handleSend}
              style={{ backgroundColor: "#263a67f3", color: "#ffff", border: "1px solid powderblue" }}
              className="input"
            />
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleSend}
              className="rounded-full"
            />
          </div>
        )}
      </Content>

      <ToastContainer position="top-right" autoClose={3000} />
    </Layout>
  );
};

export default ChatBot;