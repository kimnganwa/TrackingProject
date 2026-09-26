import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";

const EditProject = ({
  project,
  setShowModal,
  handleProjectChange
}) => {
  const [editData, setEditData] = useState({
    name: project.name || "",
    description: project.description || "",
    status: project.status || "Planning",
    start_date: project.start_date
      ? new Date(project.start_date).toISOString().split("T")[0]
      : "",
    end_date: project.end_date
      ? new Date(project.end_date).toISOString().split("T")[0]
      : "",
    in_progress: project.wip_limits?.in_progress ?? 0,
    testing: project.wip_limits?.testing ?? 0,
  });

  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-card text-foreground px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProject = async (event) => {
    event.preventDefault();

    if (!editData.name.trim()) {
      toast.error("Please enter project name");
      return;
    }

    try {
      await api.put(`/projects/${project._id}`, {
        name: editData.name.trim(),
        description: editData.description.trim(),
        status: editData.status,
        start_date: editData.start_date || null,
        end_date: editData.end_date || null,
        wip_limits: {
          in_progress: Number(editData.in_progress),
          testing: Number(editData.testing),
        },
      });

      toast.success("Project updated successfully");

      setShowModal(false);

      if (handleProjectChange) {
        handleProjectChange();
      }
    } catch (error) {
      console.error("Failed to update project:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update project"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-background text-foreground shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold">
            Edit Project
          </h2>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="rounded-md p-2 hover:bg-card transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={updateProject} className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Project Code */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Project Code
              </label>

              <Input
                value={project.code}
                disabled
                className="bg-card text-muted-foreground border-input"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={editData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Project Name */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Project Name *
              </label>

              <Input
                name="name"
                value={editData.name}
                onChange={handleChange}
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
                value={editData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start Date
              </label>

              <Input
                type="date"
                name="start_date"
                value={editData.start_date}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                End Date
              </label>

              <Input
                type="date"
                name="end_date"
                value={editData.end_date}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>


            {/* WIP Limit */}
            <div className="sm:col-span-2 mt-2 border-t border-border pt-5">
              <h3 className="font-semibold">
                WIP Limit
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                0 means unlimited.
              </p>
            </div>

            {/* In Progress */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                In Progress
              </label>

              <Input
                type="number"
                min="0"
                name="in_progress"
                value={editData.in_progress}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>

            {/* Testing */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Testing
              </label>

              <Input
                type="number"
                min="0"
                name="testing"
                value={editData.testing}
                onChange={handleChange}
                className="bg-card text-foreground border-input focus:border-primary"
              />
            </div>

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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;