import express from "express";


import {
    getAllSprints,
    getSprintById,
    createSprint,
    updateSprint,
    getSprintThroughput,
    getSprintBottlenecks
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

router.get("/:id/throughput", authorizeRoles("Admin", "User"), getSprintThroughput);

router.get("/:id/bottlenecks", authorizeRoles("Admin", "User"), getSprintBottlenecks);

export default router;