import Epic from "../models/Epic.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";

// GET /api/epics?project_id=
export const getAllEpics = async (req, res) => {
    try {
        const { project_id } = req.query;

        if (!project_id) {
            return res.status(400).json({
                message: "Project is required"
            });
        }

        const member = await ProjectMember.findOne({
            project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const epics = await Epic.find({ project_id })
            .populate("created_by", "full_name email")
            .sort({ created_at: -1 });

        res.status(200).json(epics);
    } catch (error) {
        console.error("Failed to fetch epics:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/epics/:id
export const getEpicById = async (req, res) => {
    try {
        const epic = await Epic.findById(req.params.id)
            .populate("project_id", "name code")
            .populate("created_by", "full_name email");

        if (!epic) {
            return res.status(404).json({
                message: "Epic not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: epic.project_id._id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        res.status(200).json(epic);
    } catch (error) {
        console.error("Failed to get epic:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// POST /api/epics
export const createEpic = async (req, res) => {
    try {
        const { project_id, title, description } = req.body;

        if (!project_id) {
            return res.status(400).json({
                message: "Project is required"
            });
        }

        const project = await Project.findById(project_id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (
            req.user.role !== "User" ||
            req.user.user_type !== "PM" ||
            project.created_by.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You do not have permission to create epics in this project"
            });
        }

        const lastEpic = await Epic.findOne({
            epic_code: { $regex: /^EPIC-\d+$/ }
        }).sort({ epic_code: -1 });

        let nextNumber = 1;

        if (lastEpic) {
            const lastNumber = parseInt(
                lastEpic.epic_code.split("-")[1],
                10
            );

            nextNumber = lastNumber + 1;
        }

        const epicCode = `EPIC-${String(nextNumber).padStart(4, "0")}`;

        const epic = await Epic.create({
            project_id,
            epic_code: epicCode,
            title: title.trim(),
            description: description?.trim() || "",
            created_by: req.user.id,
        });

        res.status(201).json(epic);
    } catch (error) {
        console.error("Failed to create epic:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// PUT /api/epics/:id
export const updateEpic = async (req, res) => {
    try {
        const epic = await Epic.findById(req.params.id);

        if (!epic) {
            return res.status(404).json({
                message: "Epic not found"
            });
        }

        const project = await Project.findById(epic.project_id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (
            req.user.role !== "User" ||
            req.user.user_type !== "PM" ||
            project.created_by.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You do not have permission to update this epic"
            });
        }

        const { title, description, status } = req.body;

        if (title !== undefined) epic.title = title.trim();
        if (description !== undefined) epic.description = description.trim();
        if (status !== undefined) epic.status = status;

        await epic.save();

        res.status(200).json(epic);
    } catch (error) {
        console.error("Failed to update epic:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};