import cron from "node-cron";
import Reminder from "../models/cronNotification.js";
import Users from "../models/userModel.js";

const startMorningReminder = () => {

  // Runs at 10AM daily
  cron.schedule("* * * * * *", async () => {
    // console.log("Morning Reminder Cron Running");

    try {
      const now = new Date();

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const day = new Date().getDay();

      const subjectSchedule = {
        1: "Java",
        2: "Python",
        3: "C",
        4: "C++",
        5: "DataScience"
      };

      const todaySubject = subjectSchedule[day];

      if (!todaySubject) {
        console.log("Weekend skip");
        return;
      }

      const students = await Users.find({ role: "student" });

      const sentToday = await Reminder.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).select("userId");

      const sentIds = new Set(sentToday.map(r => r.userId.toString()));

      for (const student of students) {
        if (sentIds.has(student._id.toString())) continue;

        await Reminder.create({
          userId: student._id,
          message: `Good morning ${student.name}! 📚 Today subject is ${todaySubject}.`,
          isRead: false
        });
      }

      // console.log("Reminders created successfully");

    } catch (error) {
      console.log("Cron error:", error.message);
    }

  }, {
    timezone: "Asia/Kolkata"
  });

};

export default startMorningReminder;