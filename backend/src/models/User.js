import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, trim: true },
        password_hash: { type: String, required: true },
        full_name: { type: String, required: true, trim: true },
        role: { 
            type: String, 
            enum: ["Admin", "User"], 
            required: true 
        },
        user_type: { 
            type: String, 
            enum: ["PM", "DEV", "QC"], 
            required: function () { return this.role === "User"; } 
        },
        avatar_url: { type: String, default: "" },
        is_active: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export default mongoose.model("User", userSchema);