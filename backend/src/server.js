import express from "express"; 
import ticketRoute from "./routes/ticketsRoutes.js"; 
import { connectDB } from "./config/db.js"; 
import dotenv from "dotenv"; 
 
dotenv.config(); 
 
const app = express(); 
const PORT = process.env.PORT || 5001; 
 
connectDB(); 
 
app.use(express.json()); 
 
app.use("/api/ticket", ticketRoute); 
 
app.listen(PORT, () => { 
    console.log(`Server started successfully on port ${PORT}`); 
});

