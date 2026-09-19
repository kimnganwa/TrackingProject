import Ticket from "../models/Ticket.js";
import ProjectMember from "../models/ProjectMember.js";

// GET /api/tickets
export const getAllTickets = async (req, res) => {
    try {
        const { project_id } = req.query;

        const filter = project_id ? { project_id } : {};

        const result = await Ticket.aggregate([
            { $match: filter },
            {
                $facet:{
                    tickets: [
                        {$sort: {createdAt: -1}},
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
                            project_id: 1
                            }
                        }
                    ],
                    activeCount: [
                        {
                        $match: {
                            status: {
                            $in: ["To Do", "In Progress", "Testing", "Re-Open"]
                            }
                        }
    },
    { $count: "count" }
                    ],
                    completeCount: [
                        {$match:{status:"Done"}},
                        {$count: "count"}
                    ]
                }
            }
        ])
        const tickets = result[0].tickets;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({tickets, activeCount, completeCount});
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

        const prefix = req.body.type === "Task" ? "TASK" : "BUG";

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
            ...req.body,
            ticket_code: ticketCode,
            status: "To Do",
            reporter_id: req.user.id, // Tự động gán người tạo từ token đăng nhập
        };

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

        if (req.body.status) {
            const allowedTransitions = {
                "To Do": ["In Progress"],
                "In Progress": ["Testing"],
                "Testing": ["Done", "Re-Open"],
                "Re-Open": ["In Progress"],
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
        delete req.body.ticket_code;
        Object.assign(ticket, req.body);

        await ticket.save();

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Failed to update ticket:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};
// [GET] /api/tickets/:id (Xem chi tiết Ticket)
export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("project_id", "name code")
            .populate("assignee_id", "full_name avatar_url user_type")
            .populate("reporter_id", "full_name avatar_url")
            .populate("relations.target_id", "ticket_code title type status"); 
        
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