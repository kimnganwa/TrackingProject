import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, 
        },
        email_attempt: {
            type: String,
            required: true,
        },
        ip_address: {
            type: String,
            default: "",
        },
        user_agent: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Success", "Failed"],
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false, 
        },
    }
);

const LoginLog = mongoose.model("LoginLog", loginLogSchema);

export default LoginLog;