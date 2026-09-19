import ProjectMember from "../models/ProjectMember.js";
import Project from "../models/Project.js";

// POST /api/project-members
export const addProjectMember = async (req, res) => {
    try {
        const { project_id, user_id } = req.body;

        if (req.user.role !== "User" || req.user.user_type !== "PM") {
            return res.status(403).json({
                message: "Only PM users can add members to projects"
            });
        }

        const project = await Project.findById(project_id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.created_by.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You do not have permission to add members to this project"
            });
        }

        const member = await ProjectMember.create({
            project_id,
            user_id
        });

        res.status(201).json({
            message: "Member added successfully",
            member
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "This user is already a member of the project"
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/project-members/:project_id
export const getProjectMembers = async (req, res) => {
    try {
        const members = await ProjectMember.find({
            project_id: req.params.project_id
        }).populate(
            "user_id",
            "full_name email role user_type avatar_url"
        );

        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
};