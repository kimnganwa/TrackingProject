import express from "express";

import {
    createTicket,
    getAllTickets,
    updateTicket
} from "../controllers/ticketsControllers.js";


const router = express.Router();


router.get("/", getAllTickets);

router.post("/", createTicket);

router.put("/:id", updateTicket);


export default router;