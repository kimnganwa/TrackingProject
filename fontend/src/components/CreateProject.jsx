import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";
import { jwtDecode } from "jwt-decode";

const CreateProject = ({ setShowModal, handleProjectChange }) => {
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [sprintData, setSprintData] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
  });

  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-card text-foreground px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      const token = localStorage.getItem("token");
      const currentUser = token ? jwtDecode(token) : null;

      const projectUsers = response.data.filter(
        (user) =>
          user.role === "User" &&
          user._id !== currentUser?.id
      );

      setUsers(projectUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSprintChange = (event) => {
    const { name, value } = event.target;

    setSprintData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberChange = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createProject = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter project name");
      return;
    }

    if (
      sprintData.name.trim() &&
      (!sprintData.start_date || !sprintData.end_date)
    ) {
      toast.error("Please enter sprint start date and end date");
      return;
    }

    try {
      // Create project
      const projectResponse = await api.post("/projects", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      });

      const projectId = projectResponse.data._id;

      // Add project members
      if (selectedMembers.length > 0) {
        await Promise.all(
          selectedMembers.map((userId) =>
            api.post("/project-members", {
              project_id: projectId,
              user_id: userId,
            })
          )
        );
      }

      // Create first sprint
      if (sprintData.name.trim()) {
        await api.post("/sprints", {
          project_id: projectId,
          name: sprintData.name.trim(),
          goal: sprintData.goal.trim(),
          start_date: sprintData.start_date,
          end_date: sprintData.end_date,
        });
      }

      toast.success("Project created successfully");

      setShowModal(false);

      if (handleProjectChange) {
        handleProjectChange();
      }
    } catch (error) {
      console.error("Failed to create project:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to create project"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-background text-foreground shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold">
            Create Project
          </h2>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="rounded-md p-2 hover:bg-card transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={createProject} className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Project Name */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Project Name *
              </label>

              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name..."
                className="bg-card text-foreground border-input focus:border-primary"
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
                placeholder="Enter project description..."
                rows={3}
                className="w-full rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Project Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start Date
              </label>

              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>

            {/* Project End Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                End Date
              </label>

              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>


            {/* Project Members */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Project Members
              </label>

              <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-card p-3 space-y-2">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user._id)}
                        onChange={() => handleMemberChange(user._id)}
                        className="size-4 accent-primary"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {user.full_name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {user.user_type}
                    </span>
                  </label>
                ))}

                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No users found
                  </p>
                )}
              </div>
            </div>


            {/* Initial Sprint */}
            {/*<div className="sm:col-span-2 mt-2 border-t border-border pt-5">
              <div>
                <h3 className="font-semibold">
                  Initial Sprint
                </h3>

                <p className="text-xs text-muted-foreground mt-1">
                  Optional - create the first sprint for this project.
                </p>
              </div>
            </div>*/}

            {/* Sprint Name
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Sprint Name
              </label>

              <Input
                name="name"
                value={sprintData.name}
                onChange={handleSprintChange}
                placeholder="Example: Sprint 1"
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div> */}

            {/* Sprint Goal 
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Sprint Goal
              </label>

              <textarea
                name="goal"
                value={sprintData.goal}
                onChange={handleSprintChange}
                placeholder="Enter sprint goal..."
                rows={2}
                className="w-full rounded-md border border-input bg-card text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>*/}

            {/* Sprint Start 
            <div>
              <label className="mb-1 block text-sm font-medium">
                Sprint Start Date
              </label>

              <Input
                type="date"
                name="start_date"
                value={sprintData.start_date}
                onChange={handleSprintChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>*/}

            {/* Sprint End
            <div>
              <label className="mb-1 block text-sm font-medium">
                Sprint End Date
              </label>

              <Input
                type="date"
                name="end_date"
                value={sprintData.end_date}
                onChange={handleSprintChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div> */}
              
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="bg-secondary text-secondary-foreground border-border hover:bg-accent"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;