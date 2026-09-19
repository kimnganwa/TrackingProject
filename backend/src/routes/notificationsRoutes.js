import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationsControllers.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(verifyToken);

// Đặt route /read-all TRƯỚC /:id/read để không bị nhầm /read-all thành 1 cái :id
router.put("/read-all", authorizeRoles("Admin", "User"), markAllAsRead);
router.get("/", authorizeRoles("Admin", "User"), getNotifications);
router.put("/:id/read", authorizeRoles("Admin", "User"), markAsRead);

export default router;