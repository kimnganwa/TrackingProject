import express from "express";

import {
    getAllEpics,
    getEpicById,
    createEpic,
    updateEpic
} from "../controllers/epicsControllers.js";

import {
    verifyToken,
    authorizeRoles
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", authorizeRoles("Admin", "User"), getAllEpics);

router.get("/:id", authorizeRoles("Admin", "User"), getEpicById);

router.post("/", authorizeRoles("Admin", "User"), createEpic);

router.put("/:id", authorizeRoles("Admin", "User"), updateEpic);

export default router;