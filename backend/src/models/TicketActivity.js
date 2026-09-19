import mongoose from "mongoose";

const ticketActivitySchema = new mongoose.Schema(
    {
        ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        activity_type: { 
            type: String, 
            enum: ["COMMENT", "STATUS_CHANGE", "REASSIGN", "UPDATE_INFO"], 
            required: true 
        },
        old_value: { type: String, default: "" },
        new_value: { type: String, default: "" },
        content: { type: String, default: "" }
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.model("TicketActivity", ticketActivitySchema);