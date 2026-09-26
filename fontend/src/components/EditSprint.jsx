import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";


const EditSprint = ({
  sprint,
  setShowModal,
  handleSprintChange
}) => {

  const [formData, setFormData] = useState({
    name: sprint.name || "",
    goal: sprint.goal || "",
    status: sprint.status,
    start_date: sprint.start_date
      ? new Date(sprint.start_date).toISOString().split("T")[0]
      : "",
    end_date: sprint.end_date
      ? new Date(sprint.end_date).toISOString().split("T")[0]
      : "",
  });


  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-card text-foreground px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const getStatusOptions = () => {
    if (sprint.status === "Planning") {
      return ["Planning", "Active"];
    }

    if (sprint.status === "Active") {
      return ["Active", "Completed"];
    }

    return ["Completed"];
  };


  const updateSprint = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter sprint name");
      return;
    }

    try {
      await api.put(`/sprints/${sprint._id}`, {
        name: formData.name.trim(),
        goal: formData.goal.trim(),
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      toast.success("Sprint updated successfully");

      setShowModal(false);
      handleSprintChange();

    } catch (error) {
      console.error("Failed to update sprint:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update sprint"
      );
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-xl rounded-xl border border-border bg-background shadow-xl">

        <div className="flex items-center justify-between border-b border-border p-5">

          <h2 className="text-lg font-semibold text-foreground">
            Edit Sprint
          </h2>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowModal(false)}
          >
            <X className="size-5" />
          </Button>

        </div>


        <form onSubmit={updateSprint} className="p-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Sprint Name
              </label>

              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>


            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Goal
              </label>

              <textarea
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>


            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={fieldClass}
              >
                {getStatusOptions().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Date
              </label>

              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium">
                End Date
              </label>

              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={fieldClass}
              />
            </div>

          </div>


          <div className="mt-6 flex justify-end gap-3">

            <Button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-secondary text-secondary-foreground hover:bg-accent"
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


export default EditSprint;