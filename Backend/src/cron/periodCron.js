import cron from "node-cron";

const periods = [
    { name: "Period 1", start: "09:00", end: "10:00" },
    { name: "Period 2", start: "10:00", end: "11:00" },
    { name: "Period 3", start: "11:00", end: "12:00" },
    { name: "Break", start: "12:00", end: "13:00" },
    { name: "Period 5", start: "13:00", end: "14:00" },
    { name: "Period 6", start: "14:00", end: "15:00" },
];

let currentPeriod = null;

export const getCurrentPeriod = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let period of periods) {
        const [startH, startM] = period.start.split(":").map(Number);
        const [endH, endM] = period.end.split(":").map(Number);

        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        if (currentMinutes >= startTotal && currentMinutes < endTotal) {
            return period.name;
        }
    }
    return null;
};

//USING CALLBACK HERE
export const startPeriodCron = (callback) => {
    cron.schedule("* * * * *", () => {
        const period = getCurrentPeriod();
        if (period !== currentPeriod) {
            currentPeriod = period;
            if (period) {
                console.log(`[Cron] ${period} started at ${new Date().toLocaleTimeString()}`);
                if (callback) callback(period);
            }
        }
    });

    console.log("CRON TRACKING PERIOD STARTED......! ");
};