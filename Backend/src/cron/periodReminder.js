import cron from "node-cron";
import Timetable from "../models/timetableModel.js";
import User from "../models/userModel.js";
import { sendNotifications } from "../controllers/notificationController.js";

/**
 * Get current weekday
 */
const getWeekDay = () => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[new Date().getDay()];
};

/**
 * Convert time → period (1–6)
 * 9 AM start = Period 1
 */
const getCurrentPeriod = () => {
  const now = new Date();
  const hour = now.getHours();

  const startHour = 9;
  const period = hour - startHour + 1;

  if (period < 1 || period > 6) return null;

  return period;
};

/**
 * MAIN CRON JOB
 */
export const startPeriodReminder = (app, io) => {
  // runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏰ Period Reminder Cron Running...");

      const day = getWeekDay();
      const period = getCurrentPeriod();

      if (day === "sunday") {
        console.log("Sunday - No classes");
        return;
      }

      if (!period) {
        console.log("No active period right now");
        return;
      }

      // Get all timetable entries for this period
      const timetableEntries = await Timetable.find({
        day,
        period,
      }).populate("staffId", "name");

      if (!timetableEntries.length) {
        console.log("No timetable found for this period");
        return;
      }

      for (const entry of timetableEntries) {
        const { department, subject, staffId } = entry;

        // Get users of department
        const users = await User.find({
          department,
          role: { $in: ["student", "staff"] },
        }).select("_id");

        const receiverIds = users.map((u) => u._id);

        const message = `⏰ Period ${period} started: ${subject}`;

        // Send notification using your existing system
        await sendNotifications(
          {
            user: { _id: "system", role: "system" },
            body: {
              message,
              receiverIds,
              department,
              type: "attendance",
            },
          },
          {
            app: {
              get: () => io,
            },
          }
        );

        console.log(
          `✔ Notification sent for ${department} - Period ${period}`
        );
      }
    } catch (err) {
      console.error("Period Reminder Cron Error:", err);
    }
  });
};