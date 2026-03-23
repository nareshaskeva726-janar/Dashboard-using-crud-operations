import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Project from "../models/ProjectSchema.js";

export default function NotificationSocket(io) {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(" Socket connected:", socket.id);

    // JOIN ROOM
    socket.on("join_room", async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);
      socket.join(userId.toString());

      console.log(` User ${userId} joined personal room`);

      try {
        //  FETCH UNREAD NOTIFICATIONS 
        const unreadNotifications = await Notification.find({
          receiver: userId,
          isRead: false,
        }).sort({ createdAt: -1 });


        //  SEND TO FRONTEND (ONLY ONCE ON REFRESH)
        socket.emit("loadUnreadNotifications", unreadNotifications);
      } catch (err) {
        console.error(" Error loading unread notifications:", err);
      }
    });


    // STAFF -- REMINDER
    socket.on(
      "sendReminderByDepartment",
      async ({ staffId, subject, message, pendingStudentIds }) => {
        if (!staffId || !pendingStudentIds?.length) return;

        try {
          const staff = await User.findById(staffId);
          if (!staff) return;

          await Promise.all(
            pendingStudentIds.map(async (studentId) => {
              const notification = await Notification.create({
                sender: staffId,
                receiver: studentId,
                senderRole: "staff",
                receiverRole: "student",
                department: subject,
                type: "reminder",
                message,
                isRead: false,
              });

              //  REALTIME SEND
              io.to(studentId.toString()).emit("newNotification", notification);
            })
          );
        } catch (err) {
          console.error(" sendReminder Error:", err);
        }
      }
    );

    // STUDENT → PROJECT SUBMIT 
    socket.on("projectSubmitted", async ({ studentId, projectId }) => {
      if (!studentId || !projectId) return;

      try {
        const student = await User.findById(studentId);
        const project = await Project.findById(projectId);

        if (!student || !project) return;

        const staffList = await User.find({
          role: "staff",
          department: project.subject,
        });

        await Promise.all(
          staffList.map(async (staff) => {
            const notification = await Notification.create({
              sender: studentId,
              receiver: staff._id,
              senderRole: "student",
              receiverRole: "staff",
              type: "submission",
              department: project.subject,
              message: `${student.name} submitted ${project.subject} project`,
              project: projectId,
              isRead: false,
            });

            // REALTIME SEND
            io.to(staff._id.toString()).emit("newNotification", notification);
          })
        );
      } catch (err) {
        console.error(" projectSubmitted Error:", err);
      }
    });

    // GENERAL NOTIFICATION 
    socket.on(
      "sendNotification",
      async ({ senderId, receiverIds, message, department, type }) => {
        if (!senderId || !receiverIds?.length) return;

        try {
          const sender = await User.findById(senderId);
          if (!sender) return;

          await Promise.all(
            receiverIds.map(async (receiverId) => {
              const receiver = await User.findById(receiverId);
              if (!receiver) return;

              const notification = await Notification.create({
                sender: senderId,
                receiver: receiverId,
                senderRole: sender.role,
                receiverRole: receiver.role,
                department: department || "",
                type: type || "general",
                message,
                isRead: false,
              });

              //  REALTIME SEND
              io.to(receiverId.toString()).emit("newNotification", notification);
            })
          );
        } catch (err) {
          console.error(" sendNotification Error:", err);
        }
      }
    );

    // DISCONNECT 
    socket.on("disconnect", () => {
      console.log(" Socket disconnected:", socket.id);

      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
}