import express from "express";
import { deleteAttachment } from "../controllers/attachmentsControllers.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(verifyToken);

router.delete("/:id", authorizeRoles("Admin", "User"), deleteAttachment);

export default router;