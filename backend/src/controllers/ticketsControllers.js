import Ticket from "../models/Ticket.js";
import Epic from "../models/Epic.js";
import ProjectMember from "../models/ProjectMember.js";
import mongoose from "mongoose";
import Sprint from "../models/Sprint.js";
import Project from "../models/Project.js";
import TicketActivity from "../models/TicketActivity.js";

// GET /api/tickets
export const getAllTickets = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { project_id, epic_id, parent_id, sprint_id } = req.query;

        const filter = {
            $or: [
                { assignee_id: userId },
                { reporter_id: userId }
            ]
        };

        if (project_id) {
            filter.project_id = new mongoose.Types.ObjectId(project_id);
        }

        if (epic_id) {
            filter.epic_id = new mongoose.Types.ObjectId(epic_id);
        }

        if (parent_id) {
            filter.parent_id = new mongoose.Types.ObjectId(parent_id);
        }

        if (sprint_id === "none") {
            filter.sprint_id = null;
        } else if (sprint_id) {
            filter.sprint_id = new mongoose.Types.ObjectId(sprint_id);
        }

        const result = await Ticket.aggregate([
            { $match: filter },
            {
                $facet: {
                    tickets: [
                        { $sort: { createdAt: -1 } },
                        {
                            $project: {
                                ticket_code: 1,
                                type: 1,
                                title: 1,
                                priority: 1,
                                status: 1,
                                assignee_id: 1,
                                reporter_id: 1,
                                due_date: 1,
                                project_id: 1,
                                epic_id: 1,
                                parent_id: 1,
                                sprint_id: 1,
                            }
                        }
                    ],
                    activeCount: [
                        {
                            $match: {
                                status: {
                                    $in: ["To Do", "In Progress", "Testing"]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    completeCount: [
                        { $match: { status: "Done" } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const tickets = result[0].tickets;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({ tickets, activeCount, completeCount });
    } catch (error) {
        console.error("Failed to fetch tickets:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};


// POST /api/tickets
export const createTicket = async (req, res) => {
    try {
        if (!req.body.project_id) {
            return res.status(400).json({ message: "Project is required" });
        }

        const member = await ProjectMember.findOne({
            project_id: req.body.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }


        const prefixMap = {
            Story: "STORY",
            Task: "TASK",
            Bug: "BUG"
        };

        const prefix = prefixMap[req.body.type];

        if (!prefix) {
            return res.status(400).json({
                message: "Invalid ticket type"
            });
        }
        let epicId = null;
        let parentId = null;
        let sprintId = null;

        if (req.body.sprint_id) {
            const sprint = await Sprint.findById(req.body.sprint_id);

            if (!sprint) {
                return res.status(404).json({
                    message: "Sprint not found"
                });
            }

            if (sprint.project_id.toString() !== req.body.project_id) {
                return res.status(400).json({
                    message: "Sprint and Ticket must belong to the same project"
                });
            }

            sprintId = sprint._id;
        }

        if (req.body.type === "Story" && req.body.epic_id) {
            const epic = await Epic.findById(req.body.epic_id);

            if (!epic) {
                return res.status(404).json({ message: "Epic not found" });
            }

            if (epic.project_id.toString() !== req.body.project_id) {
                return res.status(400).json({
                    message: "Epic and Story must belong to the same project"
                });
            }

            epicId = epic._id;
        }

        if ((req.body.type === "Task" || req.body.type === "Bug") && req.body.parent_id) {
            const parentTicket = await Ticket.findById(req.body.parent_id);

            if (!parentTicket) {
                return res.status(404).json({ message: "Parent Story not found" });
            }

            if (parentTicket.type !== "Story") {
                return res.status(400).json({
                    message: "Task or Bug parent must be a Story"
                });
            }

            if (parentTicket.project_id.toString() !== req.body.project_id) {
                return res.status(400).json({
                    message: "Parent Story and ticket must belong to the same project"
                });
            }

            parentId = parentTicket._id;
        }

        const lastTicket = await Ticket.findOne({
            type: req.body.type,
            ticket_code: { $regex: `^${prefix}-\\d+$` },
        }).sort({ ticket_code: -1 });

        let nextNumber = 1;

        if (lastTicket) {
            const lastNumber = parseInt(lastTicket.ticket_code.split("-")[1], 10);
            nextNumber = lastNumber + 1;
        }

        const ticketCode = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

        const ticketData = {
            project_id: req.body.project_id,
            sprint_id: sprintId,
            epic_id: epicId,
            parent_id: parentId,
            type: req.body.type,
            title: req.body.title.trim(),
            description: req.body.description?.trim() || "",
            priority: req.body.priority,
            reporter_id: req.user.id,
            ticket_code: ticketCode,
            
            
        };

        if (req.body.assignee_id) {
            ticketData.assignee_id = req.body.assignee_id;
        }

        if (req.body.due_date) {
            ticketData.due_date = req.body.due_date;
        }

        const ticket = await Ticket.create(ticketData);

        res.status(201).json(ticket);
    } catch (error) {
        console.error("Failed to create ticket:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/tickets/:id
export const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }
        const oldStatus = ticket.status;

        if (req.body.status) {
            const allowedTransitions = {
                "To Do": ["In Progress"],
                "In Progress": ["Testing"],
                "Testing": ["Done", "In Progress"],
                "Done": [],
            };

            const currentStatus = ticket.status;
            const newStatus = req.body.status;

            if (
                newStatus !== currentStatus &&
                !allowedTransitions[currentStatus].includes(newStatus)
            ) {
                return res.status(400).json({
                    message: `Cannot change status from ${currentStatus} to ${newStatus}`,
                });
            }
        }

        if (
            req.body.status &&
            req.body.status !== ticket.status &&
            ["In Progress", "Testing"].includes(req.body.status) &&
            !ticket.sprint_id
        ) {
            return res.status(400).json({
                message: "Ticket must belong to a sprint before starting workflow"
            });
        }
        if (
            req.body.status &&
            req.body.status !== ticket.status &&
            ["In Progress", "Testing"].includes(req.body.status)
        ) {
            const project = await Project.findById(ticket.project_id);

            const limit = req.body.status === "In Progress"
                ? project.wip_limits.in_progress
                : project.wip_limits.testing;

            if (limit > 0) {
                const currentWip = await Ticket.countDocuments({
                    project_id: ticket.project_id,
                    sprint_id: ticket.sprint_id,
                    status: req.body.status
                });

                if (currentWip >= limit) {
                    return res.status(400).json({
                        message: `WIP limit reached for ${req.body.status}`
                    });
                }
            }
        }


        delete req.body.ticket_code;
        delete req.body.project_id;
        delete req.body.type;
        delete req.body.reporter_id;

        if (ticket.type === "Story" && req.body.epic_id !== undefined) {
            if (req.body.epic_id) {
                const epic = await Epic.findById(req.body.epic_id);

                if (!epic) {
                    return res.status(404).json({ message: "Epic not found" });
                }

                if (epic.project_id.toString() !== ticket.project_id.toString()) {
                    return res.status(400).json({
                        message: "Epic and Story must belong to the same project"
                    });
                }
            }

            ticket.epic_id = req.body.epic_id || null;
            delete req.body.epic_id;
        }

        if (
            (ticket.type === "Task" || ticket.type === "Bug") &&
            req.body.parent_id !== undefined
        ) {
            if (req.body.parent_id) {
                const parentTicket = await Ticket.findById(req.body.parent_id);

                if (!parentTicket) {
                    return res.status(404).json({ message: "Parent Story not found" });
                }

                if (parentTicket.type !== "Story") {
                    return res.status(400).json({
                        message: "Task or Bug parent must be a Story"
                    });
                }

                if (
                    parentTicket.project_id.toString() !==
                    ticket.project_id.toString()
                ) {
                    return res.status(400).json({
                        message: "Parent Story and ticket must belong to the same project"
                    });
                }
            }

            ticket.parent_id = req.body.parent_id || null;
            delete req.body.parent_id;
        }
        if (req.body.sprint_id !== undefined) {
        if (req.body.sprint_id) {
            const sprint = await Sprint.findById(req.body.sprint_id);

            if (!sprint) {
                return res.status(404).json({
                    message: "Sprint not found"
                });
            }

            if (sprint.project_id.toString() !== ticket.project_id.toString()) {
                return res.status(400).json({
                    message: "Sprint and Ticket must belong to the same project"
                });
            }
        }

        ticket.sprint_id = req.body.sprint_id || null;
        delete req.body.sprint_id;
    }


        delete req.body.epic_id;
        delete req.body.parent_id;
        delete req.body.sprint_id;

        Object.assign(ticket, req.body);
        await ticket.save();
        if (req.body.status && req.body.status !== oldStatus) {
        await TicketActivity.create({
            ticket_id: ticket._id,
            user_id: req.user.id,
            activity_type: "STATUS_CHANGE",
            old_value: oldStatus,
            new_value: ticket.status
        });
}

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Failed to update ticket:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// [GET] /api/tickets/:id 
export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("project_id", "name code")
            .populate("assignee_id", "full_name avatar_url user_type")
            .populate("reporter_id", "full_name avatar_url")
            .populate("relations.target_id", "ticket_code title type status")
            .populate("epic_id", "epic_code title status")
            .populate("parent_id", "ticket_code title type status")
            .populate("sprint_id", "name goal status start_date end_date");

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Failed to get ticket details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// [POST] /api/tickets/:id/relations
export const addTicketRelation = async (req, res) => {
    try {
        const { target_id, relation_type } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        // Tránh add trùng target_id
        const exists = ticket.relations.find(r => r.target_id.toString() === target_id);
        if (exists) return res.status(400).json({ message: "Relation already exists" });

        ticket.relations.push({ target_id, relation_type });
        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        console.error("Failed to add relation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// [DELETE] /api/tickets/:id/relations/:targetId
export const removeTicketRelation = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        // Lọc bỏ relation có target_id trùng với URL param
        ticket.relations = ticket.relations.filter(
            r => r.target_id.toString() !== req.params.targetId
        );
        await ticket.save();

        res.status(200).json({ message: "Relation removed successfully", ticket });
    } catch (error) {
        console.error("Failed to remove relation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/tickets/:id/cycle-time
export const getTicketCycleTime = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: ticket.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const activities = await TicketActivity.find({
            ticket_id: ticket._id,
            activity_type: "STATUS_CHANGE"
        }).sort({ created_at: 1 });

        const startActivity = activities.find(
            activity => activity.new_value === "In Progress"
        );

        const doneActivity = activities.find(
            activity => activity.new_value === "Done"
        );

        if (!startActivity || !doneActivity) {
            return res.status(200).json({
                cycle_time: null
            });
        }

        const cycleTimeMs =
            doneActivity.created_at.getTime() -
            startActivity.created_at.getTime();

        res.status(200).json({
            cycle_time: cycleTimeMs
        });
    } catch (error) {
        console.error("Failed to calculate cycle time:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/tickets/:id/lead-time
export const getTicketLeadTime = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: ticket.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        const doneActivity = await TicketActivity.findOne({
            ticket_id: ticket._id,
            activity_type: "STATUS_CHANGE",
            new_value: "Done"
        }).sort({ created_at: 1 });

        if (!doneActivity) {
            return res.status(200).json({
                lead_time: null
            });
        }

        const leadTimeMs =
            doneActivity.created_at.getTime() -
            ticket.created_at.getTime();

        res.status(200).json({
            lead_time: leadTimeMs
        });
    } catch (error) {
        console.error("Failed to calculate lead time:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET /api/tickets/:id/task-aging
export const getTicketTaskAging = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const member = await ProjectMember.findOne({
            project_id: ticket.project_id,
            user_id: req.user.id
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this project"
            });
        }

        if (ticket.status === "Done") {
            return res.status(200).json({
                task_aging: null
            });
        }

        const startActivity = await TicketActivity.findOne({
            ticket_id: ticket._id,
            activity_type: "STATUS_CHANGE",
            new_value: "In Progress"
        }).sort({ created_at: 1 });

        if (!startActivity) {
            return res.status(200).json({
                task_aging: null
            });
        }

        const taskAgingMs =
            Date.now() - startActivity.created_at.getTime();

        res.status(200).json({
            task_aging: taskAgingMs
        });
    } catch (error) {
        console.error("Failed to calculate task aging:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};