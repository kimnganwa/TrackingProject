import Ticket from "../models/Ticket.js";


// GET /api/tickets
export const getAllTickets = async (req, res) => {
    try {
        const { project_id } = req.query;

        const filter = project_id ? { project_id } : {};

        const tickets = await Ticket.find(filter);

        res.status(200).json(tickets);
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
        const ticketData = {
            ...req.body,
            status: "To Do",
        };

        const ticket = await Ticket.create(ticketData);

        res.status(201).json(ticket);
    } catch (error) {
        console.error("Failed to create ticket:", error);

        res.status(500).json({
            message: "Internal server error",
        });
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