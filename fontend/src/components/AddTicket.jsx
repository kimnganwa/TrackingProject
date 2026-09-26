import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, X, Search } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const AddTicket = ({
  handleNewTicket,
  selectedProject,
  activeSprint
}) => {
  const [showModal, setShowModal] = useState(false);

  const [projectUsers, setProjectUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);

  const [formData, setFormData] = useState({
    type: "Task",
    title: "",
    description: "",
    priority: "Medium",
    assignee_id: "",
    due_date: "",
    epic_id: "",
    parent_id: "",
    sprint_id: "",
  });

  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-card text-foreground px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  const fetchProjectData = async (projectId) => {
    if (!projectId) return;

    try {
      const [membersResponse, epicsResponse, storiesResponse] =
        await Promise.all([
          api.get(`/project-members/${projectId}`),
          api.get("/epics", {
            params: { project_id: projectId },
          }),
          api.get("/tickets", {
            params: { project_id: projectId },
          }),
        ]);

      setProjectUsers(
        membersResponse.data.map((member) => member.user_id)
      );

      setEpics(epicsResponse.data);

      setStories(
        storiesResponse.data.tickets.filter(
          (ticket) => ticket.type === "Story"
        )
      );
    } catch (error) {
      console.error("Failed to load project data:", error);
      toast.error("Failed to load project data");
    }
  };

  useEffect(() => {
    if (showModal && selectedProject?._id) {
      fetchProjectData(selectedProject._id);
    }
  }, [showModal, selectedProject]);

  const openModal = () => {
    setFormData({
      type: "Task",
      title: "",
      description: "",
      priority: "Medium",
      assignee_id: "",
      due_date: "",
      epic_id: "",
      parent_id: "",
      sprint_id: activeSprint?._id || "",
    });

    setProjectUsers([]);
    setEpics([]);
    setStories([]);

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

  const handleTypeChange = (event) => {
    const value = event.target.value;

    setFormData((prev) => ({
      ...prev,
      type: value,
      epic_id: "",
      parent_id: "",
    }));
  };

  const createTicket = async (event) => {
    event.preventDefault();

    if (!selectedProject?._id) {
      toast.error("Project is required");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter ticket title");
      return;
    }

    const ticketData = {
      project_id: selectedProject._id,
      sprint_id: formData.sprint_id || null,
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      assignee_id: formData.assignee_id || null,
      due_date: formData.due_date || null,
    };

    if (formData.type === "Story") {
      ticketData.epic_id = formData.epic_id || null;
    }

    if (
      formData.type === "Task" ||
      formData.type === "Bug"
    ) {
      ticketData.parent_id = formData.parent_id || null;
    }

    try {
      const response = await api.post("/tickets", ticketData);

      toast.success(
        `Ticket ${response.data.ticket_code} added`
      );

      setShowModal(false);

      handleNewTicket();
    } catch (error) {
      console.error("Error when adding ticket:", error);

      toast.error(
        error.response?.data?.message ||
        "Error when adding ticket"
      );
    }
  };

  return (
    <>
      {/* Search + Add Ticket */}
      <Card className="p-6 border border-border bg-background shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="text"
              placeholder="Search ticket..."
              className="h-12 pl-10 text-base bg-card text-foreground placeholder:text-muted-foreground border-border focus:border-primary"
            />
          </div>

          <Button
            type="button"
            size="xl"
            className="px-6 bg-primary text-primary-foreground hover:bg-primary/90"
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
          <div className="w-full max-w-2xl rounded-xl bg-background text-foreground shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-xl font-semibold">
                Create Ticket
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 hover:bg-card transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createTicket} className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Project */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Project *
                  </label>

                  <Input
                    value={
                      selectedProject
                        ? `${selectedProject.code} - ${selectedProject.name}`
                        : ""
                    }
                    readOnly
                    className="bg-card text-foreground border-input"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Type *
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleTypeChange}
                    className={fieldClass}
                  >
                    <option value="Story">Story</option>
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                  </select>
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
                    className={fieldClass}
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
                    Title *
                  </label>

                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
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
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter ticket description..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Epic */}
                {formData.type === "Story" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Epic
                    </label>

                    <select
                      name="epic_id"
                      value={formData.epic_id}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">No Epic</option>

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
                {(formData.type === "Task" ||
                  formData.type === "Bug") && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Parent Story
                    </label>

                    <select
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">No Parent Story</option>

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

                {/* Sprint */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Sprint
                  </label>

                  <Input
                    value={
                      activeSprint
                        ? activeSprint.name
                        : "Backlog"
                    }
                    readOnly
                    className="bg-card text-foreground border-input"
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Assignee
                  </label>

                  <select
                    name="assignee_id"
                    value={formData.assignee_id}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">Unassigned</option>

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
                    value={formData.due_date}
                    onChange={handleChange}
                    className="bg-card text-foreground border-input focus:border-primary"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="bg-secondary text-secondary-foreground border-border hover:bg-accent"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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