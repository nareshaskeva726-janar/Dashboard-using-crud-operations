import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/authSlice";
import { useGetUsersQuery } from "../redux/userApi";
import { useGetMessagesQuery } from "../redux/messageApi";
import { Dropdown, Space, Input, Button } from "antd";
import { DownOutlined, SendOutlined, MessageOutlined } from "@ant-design/icons";
import socket from "../socket/socket";
import Notify from "simple-notify";

const ChatBot = () => {

  const user = useSelector(selectUser);

  const { data: usersData, isLoading, error } = useGetUsersQuery();

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatEndRef = useRef(null);

  // Load selected user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, []);





  // Fetch chat history
  const { data: chatHistory } = useGetMessagesQuery(
    {
      senderId: user?._id,
      receiverId: selectedUser?._id
    },
    {
      skip: !user?._id || !selectedUser?._id
    }
  );




  useEffect(() => {
    if (!chatHistory) return;

    if (Array.isArray(chatHistory)) {
      setMessages(chatHistory);
    } else if (chatHistory.messages) {
      setMessages(chatHistory.messages);
    }

  }, [chatHistory]);


  

  // SOCKET CONNECTION (runs once per user)
  useEffect(() => {

    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", user._id);

    // RECEIVE MESSAGE
    const receiveHandler = (data) => {

      const senderId =
        typeof data.senderId === "object"
          ? data.senderId._id
          : data.senderId;

      const receiverId =
        typeof data.receiverId === "object"
          ? data.receiverId._id
          : data.receiverId;

      const isCurrentChat =
        (senderId === selectedUser?._id && receiverId === user?._id) ||
        (senderId === user?._id && receiverId === selectedUser?._id);

      if (isCurrentChat) {
        setMessages((prev) => [...prev, data]);
      }
    };


    
    // NOTIFICATION
    const notificationHandler = (data) => {

      const senderId =
        typeof data.senderId === "object"
          ? data.senderId._id
          : data.senderId;

      if (senderId !== user?._id) {

        new Notify({
          status: "success",
          title: "New Message",
          text: data.message,
          effect: "fade",
          speed: 300,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 3000,
          position: "right top"
        });
      }
    };

    socket.on("receive_message", receiveHandler);
    socket.on("messageNotification", notificationHandler);

    return () => {
      socket.off("receive_message", receiveHandler);
      socket.off("messageNotification", notificationHandler);
    };

  }, [user, selectedUser]);







  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dropdown users
  const items =
    usersData?.users?.map((u) => ({
      key: u._id,
      label: u.name
    })) || [];

  const handleMenuClick = (e) => {

    const selected = usersData?.users?.find(
      (u) => u._id === e.key
    );

    if (!selected) return;

    setSelectedUser(selected);

    localStorage.setItem("selectedUser", JSON.stringify(selected));

    setMessages([]);
  };

  // SEND MESSAGE
  const handleSend = () => {

    if (!message.trim() || !selectedUser) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: message.trim(),
      createdAt: new Date()
    };

    socket.emit("send_message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setMessage("");
  };

  // REPLY MESSAGE
  const handleReply = () => {

    if (!message.trim() || !selectedUser) return;

    const replyData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: message.trim(),
      type: "reply",
      createdAt: new Date()
    };

    socket.emit("send_message", replyData);

    setMessages((prev) => [...prev, replyData]);

    setMessage("");
  };

  if (isLoading) return <p className="p-5">Loading users...</p>;

  if (error) return <p className="p-5 text-red-500">Error loading users</p>;





  return (
    <div className="p-4 sm:p-6 flex justify-center">

      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-4 sm:p-6">

        <h1 className="text-xl font-semibold mb-4">Chat Bot</h1>

        <p className="mb-3 text-sm sm:text-base">
          <b>FROM :</b> {user?.name || "Unknown"}
        </p>

        {/* SELECT USER */}
        <div className="mb-4">

          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >

            <span className="flex items-center gap-2 cursor-pointer select-none">
              <b>TO :</b>
              <Space>
                {selectedUser ? selectedUser.name : "Select User"}
                <DownOutlined />
              </Space>
            </span>

          </Dropdown>

        </div>

        {/* CHAT AREA */}
        <div className="border border-blue-200 rounded-md h-72 p-3 overflow-y-auto bg-gray-50 mb-4">

          {!selectedUser && (
            <p className="text-gray-400 text-sm text-center">
              Select a user to start chat
            </p>
          )}

          {messages?.length === 0 && selectedUser && (
            <p className="text-gray-400 text-sm text-center">
              No messages yet
            </p>
          )}

          {[...messages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg, index) => {

              const isSender =
                msg.senderId?.toString() === user?._id?.toString();

              return (
                <div
                  key={msg._id || index}
                  className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] break-words text-sm shadow ${isSender
                        ? "bg-blue-500 text-white"
                        : "bg-blue-200 text-black"
                      }`}
                  >

                    <div>{msg.message}</div>

                    <div className="text-[10px] mt-1 text-right opacity-70">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : ""}
                    </div>

                  </div>

                </div>
              );
            })}

          <div ref={chatEndRef} />

        </div>

        {/* INPUT */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">

          <Input
            placeholder="Type message..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value.replace(/^\s+/, ""))
            }
            onPressEnter={handleSend}
          />

          <div className="flex gap-2 sm:gap-3">

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
            >
              Send
            </Button>

            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={handleReply}
            >
              Reply
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ChatBot;