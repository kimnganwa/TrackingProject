import mongoose from "mongoose";

const relationSchema = new mongoose.Schema(
    {
        target_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
        },

        relation_type: {
            type: String,
            enum: ["BLOCKS", "RELATES_TO"],
            required: true,
        },
    },
    {
        _id: false,
    }
);

const ticketSchema = new mongoose.Schema(
    {
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        epic_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Epic",
            default: null,
        },

        ticket_code: {
            type: String
        },

        type: {
            type: String,
            enum: ["Story", "Task", "Bug"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true,
        },

        status: {
            type: String,
            enum: ["To Do", "In Progress", "Testing", "Done"],
            required: true,
            default: "To Do",
        },

        assignee_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reporter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        due_date: {
            type: Date,
            default: null,
        },

        relations: {
            type: [relationSchema],
            default: [],
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;