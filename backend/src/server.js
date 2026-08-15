import express from "express";
import taskRoute from "./routes/tasksRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB();

app.use("/api/tasks", taskRoute)

app.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`)
});

