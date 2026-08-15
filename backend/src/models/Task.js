import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "completed"],
            defalt: "active",
        },
        completeAt: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true, //mongo sẽ tự tạo ra 2 trường createAt và updateAt
    },
);

const Task = mongoose.model("Task",taskSchema);
export default Task