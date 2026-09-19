import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        notification_type: { 
            type: String, 
            enum: ["IN_APP", "EMAIL"], 
            required: true 
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String, default: "" },
        is_read: { type: Boolean, default: false }
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.model("Notification", notificationSchema);