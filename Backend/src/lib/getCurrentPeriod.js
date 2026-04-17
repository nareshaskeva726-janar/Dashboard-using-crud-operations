import Timetable from "../models/timetable.js";


const getPeriodIndex = (hour, minute) => {
  const startHour = 9;

  const period = hour - startHour + 1;

  if (period < 1 || period > 6) return null;

  return period;
};

/**
 * Get weekday name
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
 * MAIN FUNCTION
 */
export const getCurrentPeriod = async (department) => {
  try {
    const now = new Date();

    const hour = now.getHours();
    const minute = now.getMinutes();

    const day = getWeekDay();

 
    if (day === "sunday") {
      return {
        isWorkingDay: false,
        message: "Sunday Holiday",
      };
    }

    // Get current period
    const period = getPeriodIndex(hour, minute);

    if (!period) {
      return {
        isWorkingDay: true,
        isClassTime: false,
        message: "No active class right now",
      };
    }

   
    if (period === 3) {
      return {
        isWorkingDay: true,
        isBreak: true,
        period,
        message: "Break Time",
      };
    }

    const timetableEntry = await Timetable.findOne({
      department,
      day,
      period,
    }).populate("staffId", "name email");

    if (!timetableEntry) {
      return {
        isWorkingDay: true,
        isClassTime: false,
        period,
        message: "No class scheduled for this period",
      };
    }

    return {
      isWorkingDay: true,
      isClassTime: true,
      period,
      subject: timetableEntry.subject,
      staff: timetableEntry.staffId,
      department,
      day,
      time: `${hour}:${minute < 10 ? "0" + minute : minute}`,
    };
  } catch (err) {
    console.error("getCurrentPeriod error:", err);

    return {
      isWorkingDay: false,
      error: err.message,
    };
  }
};