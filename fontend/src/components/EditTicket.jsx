import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const EditTicket = ({
    ticket,
    setShowModal,
    handleTicketChange
}) => {
    const [projectUsers, setProjectUsers] = useState([]);
    const [epics, setEpics] = useState([]);
    const [stories, setStories] = useState([]);
    const [sprints, setSprints] = useState([]);

    const getId = (value) => {
        if (!value) return "";
        return typeof value === "object" ? value._id : value;
    };

    const projectId = getId(ticket.project_id);
    const isCompleted = ticket.status === "Done";
    const [editData, setEditData] = useState({
        title: ticket.title,
        description: ticket.description || "",
        type: ticket.type,
        priority: ticket.priority,
        assignee_id: getId(ticket.assignee_id),
        due_date: ticket.due_date
            ? new Date(ticket.due_date).toISOString().split("T")[0]
            : "",
        epic_id: getId(ticket.epic_id),
        parent_id: getId(ticket.parent_id),
        sprint_id: getId(ticket.sprint_id),
    });

    const fieldClass =
        "h-10 w-full rounded-md border border-input bg-card text-foreground px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId) return;

            try {
                const requests = [
                    api.get(`/project-members/${projectId}`),
                    api.get("/tickets", {
                        params: { project_id: projectId },
                    }),
                    api.get("/sprints", {
                        params: { project_id: projectId },
                    }),
                ];

                if (ticket.type === "Story") {
                    requests.push(
                        api.get("/epics", {
                            params: { project_id: projectId },
                        })
                    );
                }

                const responses = await Promise.all(requests);

                setProjectUsers(
                    responses[0].data.map(
                        (member) => member.user_id
                    )
                );

                setStories(
                    responses[1].data.tickets.filter(
                        (item) =>
                            item.type === "Story" &&
                            item._id !== ticket._id
                    )
                );

                setSprints(responses[2].data);

                if (ticket.type === "Story") {
                    setEpics(responses[3].data);
                }
            } catch (error) {
                console.error(
                    "Failed to load ticket data:",
                    error
                );

                toast.error("Failed to load ticket data");
            }
        };

        fetchProjectData();
    }, [projectId, ticket._id, ticket.type]);

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

        const ticketData = {
            title: editData.title.trim(),
            description: editData.description.trim(),
            priority: editData.priority,
            assignee_id: editData.assignee_id || null,
            due_date: editData.due_date || null,
            sprint_id: editData.sprint_id || null,
        };

        if (ticket.type === "Story") {
            ticketData.epic_id = editData.epic_id || null;
        }

        if (
            ticket.type === "Task" ||
            ticket.type === "Bug"
        ) {
            ticketData.parent_id = editData.parent_id || null;
        }

        try {
            await api.put(
                `/tickets/${ticket._id}`,
                ticketData
            );

            toast.success("Ticket updated successfully");

            setShowModal(false);

            if (handleTicketChange) {
                handleTicketChange();
            }
        } catch (error) {
            console.error(
                "Error when updating ticket:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Error when updating ticket"
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-background text-foreground shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-xl font-semibold">
                        Edit Ticket
                    </h2>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="rounded-md p-2 hover:bg-card transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={updateTicket}
                    className="p-6"
                >
                    <fieldset disabled={isCompleted}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Type
                            </label>

                            <Input
                                value={ticket.type}
                                readOnly
                                className="bg-card text-foreground border-input"
                            />
                        </div>

                        {/* Sprint */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Sprint
                            </label>

                            <select
                                name="sprint_id"
                                value={editData.sprint_id}
                                onChange={handleEditChange}
                                className={fieldClass}
                            >
                                <option value="">
                                    Backlog
                                </option>

                                {sprints.map((sprint) => (
                                    <option
                                        key={sprint._id}
                                        value={sprint._id}
                                    >
                                        {sprint.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Title *
                            </label>

                            <Input
                                name="title"
                                value={editData.title}
                                onChange={handleEditChange}
                                placeholder="Enter ticket title..."
                                className="bg-card text-foreground placeholder:text-muted-foreground border-input focus:border-primary"
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
                                className="w-full rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Priority *
                            </label>

                            <select
                                name="priority"
                                value={editData.priority}
                                onChange={handleEditChange}
                                className={fieldClass}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">
                                    Critical
                                </option>
                            </select>
                        </div>



                        {/* Epic */}
                        {ticket.type === "Story" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Epic
                                </label>

                                <select
                                    name="epic_id"
                                    value={editData.epic_id}
                                    onChange={handleEditChange}
                                    className={fieldClass}
                                >
                                    <option value="">
                                        No Epic
                                    </option>

                                    {epics.map((epic) => (
                                        <option
                                            key={epic._id}
                                            value={epic._id}
                                        >
                                            {epic.epic_code} - {epic.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Parent Story */}
                        {(ticket.type === "Task" ||
                            ticket.type === "Bug") && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Parent Story
                                </label>

                                <select
                                    name="parent_id"
                                    value={editData.parent_id}
                                    onChange={handleEditChange}
                                    className={fieldClass}
                                >
                                    <option value="">
                                        No Parent Story
                                    </option>

                                    {stories.map((story) => (
                                        <option
                                            key={story._id}
                                            value={story._id}
                                        >
                                            {story.ticket_code} - {story.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Assignee */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Assignee
                            </label>

                            <select
                                name="assignee_id"
                                value={editData.assignee_id}
                                onChange={handleEditChange}
                                className={fieldClass}
                            >
                                <option value="">
                                    Unassigned
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
                                className="bg-card text-foreground border-input focus:border-primary"
                            />
                        </div>
                        </div>
                    </fieldset>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            className="bg-secondary text-secondary-foreground border-border hover:bg-accent"
                        >
                            {isCompleted ? "Close" : "Cancel"}
                        </Button>

                        {!isCompleted && (
                            <Button
                                type="submit"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Save Changes
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicket;