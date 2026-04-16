// routes/seedRoutes.js
import express from "express";
import { seedSuperadmin } from "../controllers/seedController.js";


const seedRouter = express.Router();

// POST /api/seed/superadmin
seedRouter.post("/superadmin", seedSuperadmin);

export default seedRouter;