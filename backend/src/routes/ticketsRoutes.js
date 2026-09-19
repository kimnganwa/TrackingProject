import express from "express";

import {
    createTicket,
    getAllTickets,
    updateTicket
} from "../controllers/ticketsControllers.js";

import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js"; // Import middleware
const router = express.Router();
router.use(verifyToken);


router.get("/", authorizeRoles("Admin", "User"), getAllTickets);
router.post("/", authorizeRoles("Admin", "User"), createTicket);
router.put("/:id", authorizeRoles("Admin", "User"), updateTicket);


export default router;