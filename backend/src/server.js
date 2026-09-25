import express from "express"; 
import ticketRoute from "./routes/ticketsRoutes.js"; 
import userRoute from "./routes/userRoutes.js"; 
import authRoute from "./routes/authRoutes.js"; 
import projectRoute from "./routes/projectRoutes.js"; 
import projectMemberRoute from "./routes/projectMembersRoutes.js"; 
import { connectDB } from "./config/db.js"; 
import dotenv from "dotenv"; 
import cors from 'cors';
import epicRoute from "./routes/epicsRoutes.js";
import sprintRoute from "./routes/sprintsRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger_output.json" with { type: "json" };

dotenv.config(); 
 
const app = express(); 
const PORT = process.env.PORT || 5001; 
 
connectDB(); 
 
// middlewares
app.use(express.json()); 
app.use(cors({origin: "http://localhost:5173"}));

 
// routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/tickets", ticketRoute); 
app.use("/api/users", userRoute); 
app.use("/api/auth", authRoute);  
app.use("/api/projects", projectRoute);  
app.use("/api/project-members", projectMemberRoute); 
app.use("/api/epics", epicRoute);
app.use("/api/sprints", sprintRoute);



app.listen(PORT, () => { 
    console.log(`Server started successfully on port ${PORT}`); 
});

