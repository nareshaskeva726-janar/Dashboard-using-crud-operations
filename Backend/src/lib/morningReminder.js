import cron from "node-cron";
import Reminder from "../models/cronNotification.js";
import Users from "../models/userModel.js";

const startMorningReminder = () => {

  // Runs at 10AM daily
  cron.schedule("0 10 * * *", async () => {
    console.log("Running 10 AM Morning Reminder Cron...");


    try {
      const now = new Date();
    
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));

      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const day = new Date().getDay();
      // console.log(day, "day")

      const subjectSchedule = {
        1: "Java",
        2: "Python",
        3: "C",
        4: "C++",
        5: "DataScience"
      };

      const todaySubject =
        day === 0 || day === 6 ? null : subjectSchedule[day];

      //  Skip weekends
      if (!todaySubject) {
        console.log(" Weekend - No reminders");
        return;
      }



      const students = await Users.find({ role: "student" });

      for (let student of students) {

        //  Check already sent today
        const alreadySent = await Reminder.findOne({
          userId: student._id,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        });

        if (alreadySent) continue;

        const message = `Good morning ${student.name}! 📚 Today subject is ${todaySubject}.`;

        //  Save to DB
        await Reminder.create({
          userId: student._id,
          message,
          isRead: false, 
        });
      }



      console.log("Morning reminders created successfully");

    } catch (error) {


      console.log(" Error in cron job:", error.message);
    }

  }, {
    timezone: "Asia/Kolkata",
  });

};

export default startMorningReminder;