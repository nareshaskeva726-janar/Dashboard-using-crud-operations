import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

// DB
import connectDB from "./config/database.js";

// Routes
import Userrouter from "./routes/userRoutes.js";
import AttendanceRouter from "./routes/attendanceRoutes.js";
import reminderRouter from "./routes/reminderRoutes.js";
import seedRouter from "./routes/seedRoutes.js";
import NotificationRouter from "./routes/notficationRoutes.js";
import Projectrouter from "./routes/assignmentRoutes.js";
import ChatRouter from "./routes/chatRoutes.js";

// Sockets
import socketHandler from "./socket/chatSocket.js";
import NotificationSocket from "./socket/notificationSocket.js";

//cron
import { startPeriodReminder } from "./cron/periodReminder.js";


// ================= CONFIG =================
dotenv.config();
const PORT = process.env.PORT || 5000;

// ================= APP INIT =================
const app = express();
const server = http.createServer(app);

// ================= CORS (MUST BE FIRST) =================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dashboard-using-crud-operations.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/upload", express.static("upload"));

// ================= DB =================
connectDB();

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.status(200).send("API WORKING SUCCESSFULLY!");
});

app.use("/api/seed", seedRouter);
app.use("/api/users", Userrouter);
app.use("/api/attendance", AttendanceRouter)
app.use("/api/projects", Projectrouter);
app.use("/api/chat", ChatRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/reminders", reminderRouter);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://dashboard-using-crud-operations.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

app.set("trust proxy", 1);

// Global socket access
app.set("io", io);

// Socket handlers
socketHandler(io);
NotificationSocket(io);

//cron
startPeriodReminder(app, io);

// ================= START SERVER =================
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});