import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/database.js";
import Userrouter from "./routes/userRoutes.js";
import Messagerouter from "./routes/messageRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import notificationRouter from "./routes/notficationRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";

//  IMPORT SOCKET HANDLER
import socketHandler from "./socket/ChatSocket.js";
import NotificationSocket from "./socket/notificationSocket.js";
import startMorningReminder from "./lib/morningReminder.js";
import reminderRouter from "./routes/reminderRoutes.js";



dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// ================== MIDDLEWARE ==================
app.use("/upload", express.static("upload"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ================== DB ==================
connectDB();



// ================== ROUTES ==================
app.use("/api", Userrouter);
app.use("/api", Messagerouter);
app.use("/api", projectRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/attendance", attendanceRouter)
app.use("/api", reminderRouter);


app.get("/", (req, res) => {
  res.status(200).send("API WORKING SUCCESSFULLY!");
});

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Make io available in controllers
app.set("io", io);

socketHandler(io);
NotificationSocket(io);

// cron
startMorningReminder();

// SERVER 
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});