import User from "../models/User.js";
import LoginLog from "../models/Login_log.js";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const ip_address = req.ip || req.headers['x-forwarded-for'] || "";
        const user_agent = req.headers["user-agent"] || "";

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            await LoginLog.create({
                user_id: user ? user._id : null,
                email_attempt: email,
                ip_address,
                user_agent,
                status: "Failed",
            });

            return res.status(401).json({ message: "Invalid email or password" });
        }
        if (!user.is_active) {
        return res.status(403).json({ message: "Your account is inactive" });
        }

        await LoginLog.create({
            user_id: user._id,
            email_attempt: email,
            ip_address,
            user_agent,
            status: "Success",
        });

        const token = jwt.sign(
            { id: user._id, role: user.role, user_type: user.user_type }, 
            process.env.JWT_SECRET || "secret", 
            { expiresIn: "1d" }
        );

        res.status(200).json({ 
            message: "Logged in successfully", 
            token 
        });

    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Failed to logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password_hash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Failed to get current user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};