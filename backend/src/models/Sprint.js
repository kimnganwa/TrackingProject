import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema(
    {
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        goal: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["Planning", "Active", "Completed"],
            required: true,
            default: "Planning",
        },

        start_date: {
            type: Date,
            required: true,
        },

        end_date: {
            type: Date,
            required: true,
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

const Sprint = mongoose.model("Sprint", sprintSchema);

export default Sprint;