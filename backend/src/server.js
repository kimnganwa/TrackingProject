import express from "express"; 
import ticketRoute from "./routes/ticketsRoutes.js"; 
import userRoute from "./routes/userRoutes.js"; 
import authRoute from "./routes/authRoutes.js"; 
import { connectDB } from "./config/db.js"; 
import dotenv from "dotenv"; 
import cors from 'cors';
 
dotenv.config(); 
 
const app = express(); 
const PORT = process.env.PORT || 5001; 
 
connectDB(); 
 
// middlewares
app.use(express.json()); 
app.use(cors({origin: "http://localhost:5173"}));
 
// routes
app.use("/api/ticket", ticketRoute); 
app.use("/api/users", userRoute); 
app.use("/api/auth", authRoute);  
 
app.listen(PORT, () => { 
    console.log(`Server started successfully on port ${PORT}`); 
});