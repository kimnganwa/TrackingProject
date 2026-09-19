import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
    {
        project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        joined_at: { type: Date, default: Date.now }
    }
);

// 
projectMemberSchema.index({ project_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model("ProjectMember", projectMemberSchema);