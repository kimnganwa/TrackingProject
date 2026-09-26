import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";


const CreateSprint = ({
  project,
  setShowModal,
  handleSprintChange
}) => {

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
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


  const createSprint = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter sprint name");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select sprint dates");
      return;
    }

    try {
      await api.post("/sprints", {
        project_id: project._id,
        name: formData.name.trim(),
        goal: formData.goal.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      toast.success("Sprint created successfully");

      setShowModal(false);
      handleSprintChange();

    } catch (error) {
      console.error("Failed to create sprint:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to create sprint"
      );
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-xl rounded-xl border border-border bg-background shadow-xl">

        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Create Sprint
            </h2>

            <p className="text-sm text-muted-foreground">
              {project.name}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowModal(false)}
          >
            <X className="size-5" />
          </Button>
        </div>


        <form onSubmit={createSprint} className="p-5">

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
                placeholder="Sprint 1"
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
                placeholder="Sprint goal..."
              />
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
              Create Sprint
            </Button>

          </div>

        </form>
      </div>
    </div>
  );
};


export default CreateSprint;