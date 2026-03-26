import Reminder from "../models/cronNotification.js";

//cron Reminder
export const getCronReminder = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.find({
      userId,
      isRead: false
    }).sort({ createdAt: -1 });

    res.json(reminders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Mark all reminders as read
export const markAllRemindersAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Reminder.updateMany(
      { userId, isRead: false },
      { isRead: true } // I am making this True
    );

    res.json({ message: "All reminders marked as read" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};