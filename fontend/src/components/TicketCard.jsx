import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Pencil, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import api from "@/lib/axios";

const projectUsers = [
    {
        _id: "68a123456789abcdef123458",
        full_name: "Nguyễn Văn A",
    },
    {
        _id: "68a123456789abcdef123457",
        full_name: "Trần Văn B",
    },
];

const TicketCard = ({ ticket, index }) => {
    const isCompleted = ticket.status === "Done";

    const timeRemaining = new Date(ticket.due_date) - new Date();
    const isOverdue = timeRemaining < 0;
    const isUrgent =
        timeRemaining >= 0 && timeRemaining < 86400000;

    const [showEditModal, setShowEditModal] = useState(false);

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
            return;
        }

        try {
            await api.put(`/ticket/${ticket._id}`, {
                title: editData.title.trim(),
                description: editData.description.trim(),
                type: editData.type,
                priority: editData.priority,
                assignee_id: editData.assignee_id || null,
                due_date: editData.due_date || null,
            });

            setShowEditModal(false);

            // Tạm thời reload để lấy dữ liệu mới
            window.location.reload();
        } catch (error) {
            console.error("Error when updating ticket:", error);
        }
    };

    return (
        <>
            {/* Ticket Card */}
            <Card
                className={cn(
                    "p-4 border-0 bg-gradient-card shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
                    isCompleted && "opacity-75"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <div className="flex items-center gap-4">

                    {/* Status Icon */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "flex-shrink-0 size-8 rounded-full transition-all duration-200",
                            isCompleted
                                ? "text-success hover:text-success/80"
                                : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        {isCompleted ? (
                            <CheckCircle2 className="size-5" />
                        ) : (
                            <Circle className="size-5" />
                        )}
                    </Button>

                    {/* Ticket Information */}
                    <div className="flex-1 min-w-0">

                        <p
                            className={cn(
                                "text-base transition-all duration-200",
                                isCompleted
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                            )}
                        >
                            {ticket.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-1">
    <span className="text-xs text-muted-foreground">
        Created:{" "}
        {new Date(ticket.created_at).toLocaleDateString()}
    </span>

    <span className={cn(
        "text-xs font-medium",
        isOverdue
            ? "text-destructive"
            : isUrgent
            ? "text-amber-500"
            : "text-blue-500"
    )}>
        Due:{" "}
        {ticket.due_date
            ? new Date(ticket.due_date).toLocaleDateString()
            : "No due date"}
    </span>

    <span className="text-xs text-muted-foreground">
        Assignee:{" "}
        {projectUsers.find(
            (user) => user._id === ticket.assignee_id
        )?.full_name || "Unassigned"}
    </span>
</div>
                    </div>

                    {/* Edit Button */}
                    <div className="hidden gap-2 group-hover:inline-flex animate-slide-up">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 size-8 rounded-full transition-all duration-200"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Edit Ticket Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">

                            <h2 className="text-xl font-semibold">
                                Edit Ticket
                            </h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                                className="rounded-md p-2 hover:bg-slate-100"
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
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="Task">
                                            Task
                                        </option>

                                        <option value="Bug">
                                            Bug
                                        </option>
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
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Medium">
                                            Medium
                                        </option>

                                        <option value="High">
                                            High
                                        </option>

                                        <option value="Critical">
                                            Critical
                                        </option>
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
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                                    onClick={() =>
                                        setShowEditModal(false)
                                    }
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
            )}
        </>
    );
};

export default TicketCard;