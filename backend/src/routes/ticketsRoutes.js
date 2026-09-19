import express from "express";

import {
    addTicketRelation,
    createTicket,
    getAllTickets,
    getTicketById,
    removeTicketRelation,
    updateTicket
} from "../controllers/ticketsControllers.js";

import { getTicketActivities, createTicketActivity } from "../controllers/ticketActivitiesControllers.js";
import { getAttachments, uploadAttachment } from "../controllers/attachmentsControllers.js";

import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js"; // Import middleware
const router = express.Router();
router.use(verifyToken);


router.get("/", authorizeRoles("Admin", "User"), getAllTickets);
router.post("/", authorizeRoles("Admin", "User"), createTicket);
router.put("/:id", authorizeRoles("Admin", "User"), updateTicket);
router.get("/:id", authorizeRoles("Admin", "User"), getTicketById);
router.post("/:id/relations", authorizeRoles("Admin", "User"), addTicketRelation);
router.delete("/:id/relations/:targetId", authorizeRoles("Admin", "User"), removeTicketRelation);

// API Ticket Activities
router.get("/:id/activities", authorizeRoles("Admin", "User"), getTicketActivities);
router.post("/:id/activities", authorizeRoles("Admin", "User"), createTicketActivity);

// API Ticket Attachments
router.get("/:id/attachments", authorizeRoles("Admin", "User"), getAttachments);
router.post("/:id/attachments", authorizeRoles("Admin", "User"), uploadAttachment);




export default router;