export const PERIOD_SCHEDULE = [
  { period: 1, start: "10:00", end: "11:00" },
  { period: 2, start: "11:00", end: "12:00" },
  { period: 3, start: "12:00", end: "13:00" },
  { period: 4, start: "13:00", end: "14:00" },
  { period: 5, start: "14:00", end: "15:00" },
  { period: 6, start: "15:00", end: "16:00" },
];

export const getCurrentPeriod = () => {
  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  for (const slot of PERIOD_SCHEDULE) {
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    ) {
      return String(slot.period); // keep string for Mongo consistency
    }
  }

  return null;
};