import Attachment from "../models/Attachment.js";

// GET /api/tickets/:id/attachments
export const getAttachments = async (req, res) => {
    try {
        const attachments = await Attachment.find({ ticket_id: req.params.id })
            .populate("uploaded_by", "full_name avatar_url");
        res.status(200).json(attachments);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// POST /api/tickets/:id/attachments
export const uploadAttachment = async (req, res) => {
    try {
        const { file_name, file_url, file_size, file_type } = req.body;

        const newAttachment = await Attachment.create({
            ticket_id: req.params.id,
            file_name,
            file_url,
            file_size,
            file_type,
            uploaded_by: req.user.id
        });
        res.status(201).json(newAttachment);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// DELETE /api/attachments/:id
export const deleteAttachment = async (req, res) => {
    try {
        const attachment = await Attachment.findByIdAndDelete(req.params.id);
        if (!attachment) return res.status(404).json({ message: "Attachment not found" });
        
        res.status(200).json({ message: "Xóa tệp đính kèm thành công" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};