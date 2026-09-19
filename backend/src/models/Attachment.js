import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
    {
        ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
        file_size: { type: Number },
        file_type: { type: String },
        uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.model("Attachment", attachmentSchema);