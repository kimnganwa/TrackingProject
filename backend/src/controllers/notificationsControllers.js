import Notification from "../models/Notification.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id })
            .sort({ created_at: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { is_read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user_id: req.user.id, is_read: false },
            { is_read: true }
        );
        res.status(200).json({ message: "Đã đánh dấu đọc tất cả thông báo" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};