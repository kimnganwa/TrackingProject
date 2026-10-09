import express from "express";
import { addProjectMember, getProjectMembers,removeProjectMember  } from "../controllers/projectMembersControllers.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(verifyToken);

router.get("/:project_id", authorizeRoles("Admin", "User"), getProjectMembers);
router.post("/", authorizeRoles("Admin", "User"), addProjectMember);
router.delete("/:project_id/:user_id", authorizeRoles("Admin", "User"), removeProjectMember);

export default router;