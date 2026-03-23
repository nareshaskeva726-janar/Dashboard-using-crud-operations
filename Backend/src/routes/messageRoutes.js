import express from "express";
import { msgconnect } from "../controllers/messageControllers.js";

const Messagerouter = express.Router();

Messagerouter.get("/messages/:senderId/:receiverId", msgconnect);

export default Messagerouter;