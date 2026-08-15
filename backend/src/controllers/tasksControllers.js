import Task from '../models/Task.js'

export const getAllTasks = async(req, res) =>{
    try {
        const task = await Task.find();
        res.status(200).send("Tasks loaded successfully");
    } catch (error) {
        console.error("Failed to fetch API getAllTasks.");
        res.status(500).send("Internal server error");
    }
};

export const createTask = (req, res) =>{
    res.status(201).json({ message:"success"});
};

export const updateTask = (req, res) =>{
    res.status(201).json({ message:"success"});
};