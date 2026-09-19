import express from "express";

import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject
} from "../controllers/projectsControllers.js";

import { createTicket } from "../controllers/ticketsControllers.js";

import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", authorizeRoles("Admin", "User"), getAllProjects);

router.get("/:id", authorizeRoles("Admin", "User"), getProjectById);

router.post("/", authorizeRoles("Admin", "User"), createProject);

router.put("/:id", authorizeRoles("Admin", "User"), updateProject);

router.post("/:id/tickets", authorizeRoles("Admin", "User"), createTicket);

export default router;