import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const EditTicket = ({ ticket, users, setShowModal }) => {
    const [projectUsers, setProjectUsers] = useState([]);
    
    const [editData, setEditData] = useState({
        title: ticket.title,
        description: ticket.description || "",
        type: ticket.type,
        priority: ticket.priority,
        assignee_id: ticket.assignee_id || "",
        due_date: ticket.due_date
            ? new Date(ticket.due_date).toISOString().split("T")[0]
            : "",
    });

    React.useEffect(() => {
        const fetchProjectMembers = async () => {
            try {
                const projectId =
                    typeof ticket.project_id === "object"
                        ? ticket.project_id._id
                        : ticket.project_id;

                const response = await api.get(
                    `/project-members/${projectId}`
                );

                setProjectUsers(
                    response.data.map((member) => member.user_id)
                );
            } catch (error) {
                console.error(
                    "Failed to fetch project members:",
                    error
                );
                toast.error("Failed to load project members");
            }
        };

        fetchProjectMembers();
    }, [ticket.project_id]);

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const updateTicket = async (event) => {
        event.preventDefault();

        if (!editData.title.trim()) {
            toast.error("Please enter ticket title");
            return;
        }

        try {
            await api.put(`/tickets/${ticket._id}`, {
                title: editData.title.trim(),
                description: editData.description.trim(),
                type: editData.type,
                priority: editData.priority,
                assignee_id: editData.assignee_id || null,
                due_date: editData.due_date || null,
            });

            toast.success("Ticket updated successfully");

            setShowModal(false);

            window.location.reload();
        } catch (error) {
            console.error("Error when updating ticket:", error);
            toast.error("Error when updating ticket");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            {/* Background card */}
            <div className="w-full max-w-2xl rounded-xl bg-card text-card-foreground shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">

                    <h2 className="text-xl font-semibold">
                        Edit Ticket
                    </h2>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="rounded-md p-2 hover:bg-black/10 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={updateTicket}
                    className="p-6"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Type
                            </label>

                            <select
                                name="type"
                                value={editData.type}
                                onChange={handleEditChange}
                                className="h-10 w-full rounded-md border border-input bg-white text-card-foreground px-3 text-sm"
                            >
                                <option value="Task">Task</option>
                                <option value="Bug">Bug</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Priority
                            </label>

                            <select
                                name="priority"
                                value={editData.priority}
                                onChange={handleEditChange}
                                className="h-10 w-full rounded-md border border-input bg-white text-card-foreground px-3 text-sm"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Title
                            </label>

                            <Input
                                name="title"
                                value={editData.title}
                                onChange={handleEditChange}
                                placeholder="Enter ticket title..."
                                className="bg-white text-card-foreground"
                            />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={editData.description}
                                onChange={handleEditChange}
                                placeholder="Enter ticket description..."
                                rows={4}
                                className="w-full rounded-md border border-input bg-white text-card-foreground px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Due Date
                            </label>

                            <Input
                                type="date"
                                name="due_date"
                                value={editData.due_date}
                                onChange={handleEditChange}
                                className="bg-white text-card-foreground"
                            />
                        </div>

                        {/* Assignee */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Assignee
                            </label>

                            <select
                                name="assignee_id"
                                value={editData.assignee_id}
                                onChange={handleEditChange}
                                className="h-10 w-full rounded-md border border-input bg-white text-card-foreground px-3 text-sm"
                            >
                                <option value="">
                                    Select assignee
                                </option>

                                {projectUsers.map((user) => (
                                    <option
                                        key={user._id}
                                        value={user._id}
                                    >
                                        {user.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            className="bg-white hover:bg-slate-100 text-card-foreground"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="gradient"
                        >
                            Save Changes
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicket;