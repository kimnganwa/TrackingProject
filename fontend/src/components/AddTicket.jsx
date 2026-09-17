import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, X, Search } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const AddTicket = ({ handleNewTicket }) => {
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    type: "Task",
    title: "",
    description: "",
    priority: "Medium",
    assignee_id: "",
    due_date: "",
  });

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
  const openModal = () => {
    setFormData({
      type: "Task",
      title: "",
      description: "",
      priority: "Medium",
      assignee_id: "",
      due_date: "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createTicket = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter ticket title");
      return;
    }

    const ticketData = {
      project_id: "6a8050136778f35b19ce1602",
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      reporter_id: "68a123456789abcdef123458",
    };

    if (formData.assignee_id.trim()) {
      ticketData.assignee_id = formData.assignee_id.trim();
    }

    if (formData.due_date) {
      ticketData.due_date = formData.due_date;
    }

    try {
      const response = await api.post("/ticket", ticketData);

      toast.success(`Ticket ${response.data.ticket_code} added`);
      setShowModal(false);

      setFormData({
        type: "Task",
        title: "",
        description: "",
        priority: "Medium",
        assignee_id: "",
        due_date: "",
      });

      handleNewTicket();
    } catch (error) {
      console.error("Error occur when add new ticket", error);
      toast.error("Error occur when add new ticket");
    }
  };

  return (
    <>
      {/* Search + Add Ticket */}
      <Card className="p-6 bolder-0 bg-gradient-card shadow-custom-lg">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="text"
              placeholder="Search ticket..."
              className="h-12 pl-10 text-base bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          <Button
            variant="gradient"
            size="xl"
            className="px-6"
            onClick={openModal}
          >
            Add Ticket
            <Plus className="size-5" />
          </Button>
        </div>
      </Card>

      {/* Create Ticket Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">
                Create Ticket
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createTicket} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Type *
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Title *
                  </label>

                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
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
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter ticket description..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Priority *
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
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
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </div>

              {/* Assignee */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Assignee
                </label>

                <select
                  name="assignee_id"
                  value={formData.assignee_id}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select assignee</option>

                  {projectUsers.map((user) => (
                    <option key={user._id} value={user._id}>
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
                  onClick={closeModal}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="gradient"
                >
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTicket;