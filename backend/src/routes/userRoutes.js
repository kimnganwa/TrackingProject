import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/usersControllers.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả API User đều cần đăng nhập
router.use(verifyToken);

router.get("/", authorizeRoles("Admin", "User"), getAllUsers);
router.post("/", authorizeRoles("Admin"), createUser); 
router.get("/:id", authorizeRoles("Admin", "User"), getUserById);
router.put("/:id", authorizeRoles("Admin", "User"), updateUser); 
router.delete("/:id", authorizeRoles("Admin"), deleteUser); 

export default router;