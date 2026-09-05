import Ticket from "../models/Ticket.js";


// GET /api/tickets
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();

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
        const ticket = await Ticket.create(req.body);
        res.status(201).json(ticket);
    } catch (error) {
        console.error("Failed to create ticket:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// PUT /api/tickets/:id
export const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Failed to update ticket:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};