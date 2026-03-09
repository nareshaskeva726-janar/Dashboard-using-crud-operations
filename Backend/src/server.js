import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import connectDB from "./config/database.js";
import Userrouter from "./routes/userRoutes.js";

//DOTENV CONFIGURATION
dotenv.config();

//EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5000

//MIDDLEWARE
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})
);
app.use(cookieParser());

//API ENDPOINTS
app.use("/api", Userrouter)
app.get("/", (req, res) => res.status(200).send("API Working Successfully!"));

//DATABASE CONNECTION
connectDB();

//APP LISTENING
app.listen(PORT, () => {
    console.log(`server is running in the http://localhost:${PORT}`)
})