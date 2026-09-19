import TicketActivity from "../models/TicketActivity.js";

// GET /api/tickets/:id/activities
export const getTicketActivities = async (req, res) => {
    try {
        const activities = await TicketActivity.find({ ticket_id: req.params.id })
            .populate("user_id", "full_name email avatar_url")
            .sort({ created_at: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// POST /api/tickets/:id/activities
export const createTicketActivity = async (req, res) => {
    try {
        const { activity_type, old_value, new_value, content } = req.body;

        const newActivity = await TicketActivity.create({
            ticket_id: req.params.id,
            user_id: req.user.id,
            activity_type,
            old_value,
            new_value,
            content
        });
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};