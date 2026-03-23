import Message from "../models/Message.js";
import Notification from "../models/notificationModel.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

   //JOIN ROOM 
    socket.on("join_room", (userId) => {
      if (!userId) return;

      socket.join(userId.toString());
      console.log(`User ${userId} joined room`);
    });




    // CHAT APP
    socket.on("send_message", async (data) => {
      try {
        const newMessage = await Message.create({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
        });

        const populatedMessage = await newMessage.populate([
          { path: "senderId", select: "name" },
          { path: "receiverId", select: "name" },
        ]);

        // ✅ Send message
        io.to(data.receiverId.toString()).emit(
          "receive_message",
          populatedMessage
        );

        // CHAT NOTFICATION
        io.to(data.receiverId.toString()).emit("messageNotification", {
          senderId: data.senderId,
          senderName: populatedMessage.senderId.name,
          message: data.message,
        });
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // STAFF --- STUDENTS
    socket.on("sendReminder", async ({ studentIds, message, staffId }) => {
      try {
        if (!studentIds || studentIds.length === 0) return;

        // SAVE NOTIFICATION
        const notifications = await Notification.insertMany(
          studentIds.map((studentId) => ({
            sender: staffId,
            receiver: studentId,
            senderRole: "staff",
            receiverRole: "student",
            message,
            type: "reminder",
            isRead: false,
          }))
        );

       // REAL TIME NOTIFY
        studentIds.forEach((studentId) => {
          io.to(studentId.toString()).emit("newNotification", {
            message,
            senderRole: "staff",
            receiverRole: "student",
          });
        });

        console.log("Reminder sent:", notifications.length);
      } catch (err) {
        console.error("Reminder error:", err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketHandler;