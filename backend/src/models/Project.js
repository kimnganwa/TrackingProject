import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String, default: "" },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["Planning", "Active", "Completed"],
            required: true,
            default: "Planning"
        },
        start_date: { type: Date },
        end_date: { type: Date }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

export default mongoose.model("Project", projectSchema);