import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";

// GET /api/projects
export const getAllProjects = async (req, res) => {
    try {
        const members = await ProjectMember.find({ user_id: req.user.id }).select("project_id");
        const projectIds = members.map(member => member.project_id);

        const projects = await Project.find({ _id: { $in: projectIds } })
            .populate("created_by", "full_name email user_type");

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/projects/:id
export const getProjectById = async (req, res) => {
    try {
        const member = await ProjectMember.findOne({
            project_id: req.params.id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You do not have permission to view this project"
            });
        }

        const project = await Project.findById(req.params.id)
            .populate("created_by", "full_name email user_type");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/projects
export const createProject = async (req, res) => {
    try {
        if (req.user.role !== "User" || req.user.user_type !== "PM") {
            return res.status(403).json({
                message: "Only PM users can create projects"
            });
        }

        let { name, code, description, status, start_date, end_date } = req.body;

        code = code.toUpperCase().trim();
        if (!code.startsWith("PRJ-")) code = `PRJ-${code}`;

        const newProject = await Project.create({
            name,
            code,
            description,
            status,
            start_date,
            end_date,
            created_by: req.user.id
        });

        await ProjectMember.create({
            project_id: newProject._id,
            user_id: req.user.id
        });

        res.status(201).json(newProject);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Project code already exists" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/projects/:id
export const updateProject = async (req, res) => {
    try {
        if (req.user.role !== "User" || req.user.user_type !== "PM") {
            return res.status(403).json({
                message: "Only PM users can update projects"
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.created_by.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You do not have permission to update this project"
            });
        }

        const { name, description, status, start_date, end_date } = req.body;

        if (name !== undefined) project.name = name;
        
        if (description !== undefined) project.description = description;
        if (status !== undefined) project.status = status;
        if (start_date !== undefined) project.start_date = start_date;
        if (end_date !== undefined) project.end_date = end_date;

        await project.save();

        res.status(200).json(project);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Project code already exists" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
};