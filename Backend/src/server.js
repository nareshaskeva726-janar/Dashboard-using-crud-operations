import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import Userrouter from "./routes/userRoutes.js";
import socketHandler from "./socket/chatSocket.js";
import NotificationSocket from "./socket/notificationSocket.js";
import reminderRouter from "./routes/reminderRoutes.js";
import seedRouter from "./routes/seedRoutes.js";
import NotificationRouter from "./routes/notficationRoutes.js";
import Projectrouter from "./routes/assignmentRoutes.js";
import AttendanceRouter from "./routes/attendanceRoutes.js";
import ChatRouter from "./routes/chatRoutes.js";
// import { startPeriodCron } from "./cron/periodCron.js";

//DOTENV CONFIGURATION
dotenv.config();
const PORT = process.env.PORT || 5000;

//EXPRESS TO SOCKET
const app = express();
const server = http.createServer(app);

//MIDDLEWARE
app.use("/upload", express.static("upload"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//ALLOW BY CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dashboard-using-crud-operations.vercel.app"
    ],
    credentials: true,
  })
);

//DATABASE
connectDB();

//API ENDPOINTS
app.use("/api/seed", seedRouter);
app.use("/api/users", Userrouter);
app.use("/api/chat", ChatRouter);
app.use("/api/projects", Projectrouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/attendance", AttendanceRouter);
app.use("/api/reminders", reminderRouter);


//API ENDPOINT TEST
app.get("/", (req, res) => {
  res.status(200).send("API WORKING SUCCESSFULLY!");
});


// SOCKET.IO GLOBAL
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://dashboard-using-crud-operations.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//GLOBAL IO SOCKET
app.set("io", io);


// SOCKET FUNCTIONS
socketHandler(io);
NotificationSocket(io);

// SERVER 
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

//CRON FOR PERIOD!
// startPeriodCron((periodIndex)=> {
//   console.log("Now The period is :" , periodIndex);
// })