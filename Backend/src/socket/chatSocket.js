import Chat from "../models/chatModel.js";

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ userId }) => {
      socket.userId = userId;
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send_message", async (data) => {

      const { senderId, receiverId, message } = data;

      try {
        if (!senderId || !receiverId || !message) return;

        const users = [senderId.toString(), receiverId.toString()].sort();
        const conversationId = users.join("_");

        const newMessage = await Chat.create({
          sender: senderId,
          receiver: receiverId,
          conversationId,
          message,
        });

        const populated = await newMessage.populate("sender receiver", "name role");

        io.to(senderId).emit("receive_message", populated);

        io.to(receiverId).emit("receive_message", populated);

        io.to(receiverId).emit("live_notification", {
          message: `New message from ${populated.sender.name}`,
          chat: populated,
        });

      } catch (err) {
        console.log("Socket send_message error:", err);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) onlineUsers.delete(socket.userId);
      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketHandler;