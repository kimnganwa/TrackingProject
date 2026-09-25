import Sprint from "../models/Sprint.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Ticket from "../models/Ticket.js";
import TicketActivity from "../models/TicketActivity.js";

// GET /api/sprints?project_id=
export const getAllSprints = async (req, res) => {
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

        const sprints = await Sprint.find({ project_id })
            .populate("created_by", "full_name email")
            .sort({ created_at: -1 });

        res.status(200).json(sprints);
    } catch (error) {
        console.error("Failed to fetch sprints:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/sprints/:id
export const getSprintById = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id)
            .populate("project_id", "name code")
            .populate("created_by", "full_name email");

        if (!sprint) {
            return res.status(404).json({
                message: "Sprint not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: sprint.project_id._id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        res.status(200).json(sprint);
    } catch (error) {
        console.error("Failed to get sprint:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// POST /api/sprints
export const createSprint = async (req, res) => {
    try {
        const {
            project_id,
            name,
            goal,
            start_date,
            end_date
        } = req.body;

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
                message: "You do not have permission to create sprints in this project"
            });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        const sprint = await Sprint.create({
            project_id,
            name: name.trim(),
            goal: goal?.trim() || "",
            start_date,
            end_date,
            created_by: req.user.id,
        });

        res.status(201).json(sprint);
    } catch (error) {
        console.error("Failed to create sprint:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// PUT /api/sprints/:id
export const updateSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({
                message: "Sprint not found"
            });
        }

        const project = await Project.findById(sprint.project_id);

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
                message: "You do not have permission to update this sprint"
            });
        }

        const {
            name,
            goal,
            status,
            start_date,
            end_date
        } = req.body;

        const newStartDate = start_date || sprint.start_date;
        const newEndDate = end_date || sprint.end_date;

        if (new Date(newStartDate) >= new Date(newEndDate)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        if (status && status !== sprint.status) {
            const allowedTransitions = {
                Planning: ["Active"],
                Active: ["Completed"],
                Completed: [],
            };

            if (!allowedTransitions[sprint.status].includes(status)) {
                return res.status(400).json({
                    message: `Cannot change sprint status from ${sprint.status} to ${status}`
                });
            }
        }

        if (name !== undefined) sprint.name = name.trim();
        if (goal !== undefined) sprint.goal = goal.trim();
        if (status !== undefined) sprint.status = status;
        if (start_date !== undefined) sprint.start_date = start_date;
        if (end_date !== undefined) sprint.end_date = end_date;

        await sprint.save();

        res.status(200).json(sprint);
    } catch (error) {
        console.error("Failed to update sprint:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

 // GET /api/sprints/:id/throughput
export const getSprintThroughput = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({
                message: "Sprint not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: sprint.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const tickets = await Ticket.find({
            sprint_id: sprint._id
        }).select("_id");

        const ticketIds = tickets.map(ticket => ticket._id);

        const throughput = await TicketActivity.countDocuments({
            ticket_id: { $in: ticketIds },
            activity_type: "STATUS_CHANGE",
            new_value: "Done",
            created_at: {
                $gte: sprint.start_date,
                $lte: sprint.end_date
            }
        });

        res.status(200).json({
            throughput
        });
    } catch (error) {
        console.error("Failed to calculate throughput:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/sprints/:id/bottlenecks
export const getSprintBottlenecks = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({
                message: "Sprint not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: sprint.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const project = await Project.findById(sprint.project_id);

        const tickets = await Ticket.find({
            sprint_id: sprint._id
        });

        const ticketIds = tickets.map(ticket => ticket._id);

        // Tính Cycle Time của các ticket đã Done
        const activities = await TicketActivity.find({
            ticket_id: { $in: ticketIds },
            activity_type: "STATUS_CHANGE"
        }).sort({ created_at: 1 });

        const cycleTimes = [];

        for (const ticket of tickets) {
            const ticketActivities = activities.filter(
                activity =>
                    activity.ticket_id.toString() === ticket._id.toString()
            );

            const startActivity = ticketActivities.find(
                activity => activity.new_value === "In Progress"
            );

            const doneActivity = ticketActivities.find(
                activity => activity.new_value === "Done"
            );

            if (startActivity && doneActivity) {
                cycleTimes.push(
                    doneActivity.created_at.getTime() -
                    startActivity.created_at.getTime()
                );
            }
        }

        // Chưa đủ dữ liệu lịch sử để tính SLE
        if (cycleTimes.length === 0) {
            return res.status(200).json({
                sle: null,
                bottlenecks: []
            });
        }

        // SLE = percentile 85 của Cycle Time
        cycleTimes.sort((a, b) => a - b);

        const index = Math.ceil(0.85 * cycleTimes.length) - 1;
        const sle = cycleTimes[index];

        const bottlenecks = [];

        const statuses = [
            {
                status: "In Progress",
                limit: project.wip_limits.in_progress
            },
            {
                status: "Testing",
                limit: project.wip_limits.testing
            }
        ];

        for (const item of statuses) {
            const currentTickets = tickets.filter(
                ticket => ticket.status === item.status
            );

            const currentWip = currentTickets.length;

            // WIP Limit = 0 nghĩa là không giới hạn
            if (item.limit === 0 || currentWip !== item.limit) {
                continue;
            }

            const agingTickets = [];

            for (const ticket of currentTickets) {
                const startActivity = activities.find(
                    activity =>
                        activity.ticket_id.toString() === ticket._id.toString() &&
                        activity.new_value === "In Progress"
                );

                if (!startActivity) {
                    continue;
                }

                const taskAging =
                    Date.now() - startActivity.created_at.getTime();

                if (taskAging >= sle) {
                    agingTickets.push({
                        ticket_id: ticket._id,
                        ticket_code: ticket.ticket_code,
                        task_aging: taskAging
                    });
                }
            }

            if (agingTickets.length > 0) {
                bottlenecks.push({
                    status: item.status,
                    current_wip: currentWip,
                    wip_limit: item.limit,
                    aging_tickets: agingTickets
                });
            }
        }

        res.status(200).json({
            sle,
            bottlenecks
        });
    } catch (error) {
        console.error("Failed to detect bottlenecks:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};