import Notification from "../models/notificationModel.js";

export default function NotificationSocket(io) {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // join room
    socket.on("join_room", async (userId) => {
      try {
        
        if (!userId) return;

        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        // console.log(`User ${userId} joined personal room`);

        const unread = await Notification
          .find({ receiver: userId, isRead: false })
          .sort({ createdAt: 1 });

        socket.emit("loadUnreadNotifications", unread);
      } catch (error) {
        console.error("Join room error:", error.message);
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}