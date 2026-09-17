import User from "../models/User.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password_hash");
        res.status(200).json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password_hash");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Failed to fetch user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/users
export const createUser = async (req, res) => {
    try {
        
        const user = await User.create(req.body);
        const userResponse = user.toObject();
        delete userResponse.password_hash; 
        res.status(201).json(userResponse);
    } catch (error) {
        console.error("Failed to create user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
       
        if (req.user.role !== "Admin" && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        Object.assign(user, req.body);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password_hash; 
        res.status(200).json(userResponse);
    } catch (error) {
        console.error("Failed to update user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE /api/users/:id (Soft Delete)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.is_active = false; // Soft delete
        await user.save();

        res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
        console.error("Failed to delete user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};