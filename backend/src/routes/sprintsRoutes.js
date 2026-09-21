import express from "express";

import {
    getAllSprints,
    getSprintById,
    createSprint,
    updateSprint
} from "../controllers/sprintsControllers.js";

import {
    verifyToken,
    authorizeRoles
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", authorizeRoles("Admin", "User"), getAllSprints);

router.get("/:id", authorizeRoles("Admin", "User"), getSprintById);

router.post("/", authorizeRoles("Admin", "User"), createSprint);

router.put("/:id", authorizeRoles("Admin", "User"), updateSprint);



export default router;