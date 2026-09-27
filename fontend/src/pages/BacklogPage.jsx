import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import ProjectSidebar from '@/components/ProjectSidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Archive,
  CalendarDays,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

import { useNavigate, useParams } from 'react-router';

const BacklogPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState("");
  const [productBacklog, setProductBacklog] = useState([]);
  const [sprintBacklog, setSprintBacklog] = useState([]);
  const [loading, setLoading] = useState(false);
  const { projectCode } = useParams();
  


  useEffect(() => {
    fetchCurrentProject();
    }, [projectCode]);

  useEffect(() => {
    if (selectedProject && selectedSprint) {
      fetchSprintBacklog(selectedProject._id, selectedSprint);
    } else {
      setSprintBacklog([]);
    }
  }, [selectedSprint]);
  const fetchCurrentProject = async () => {
    try {
        const res = await api.get("/projects");

        const project = res.data.find(
        project => project.code === projectCode
        );

        if (!project) {
        toast.error("Project not found");
        return;
        }

        setSelectedProject(project);

        await Promise.all([
        fetchBacklog(project._id),
        fetchSprints(project._id)
        ]);

    } catch (error) {
        console.error("Failed to fetch project:", error);
        toast.error("Failed to fetch project");
    }
    };

  const fetchSprints = async (projectId) => {
    try {
      const res = await api.get("/sprints", {
        params: {
          project_id: projectId
        }
      });

      setSprints(res.data);

      const activeSprint = res.data.find(
        sprint => sprint.status === "Active"
      );

      if (activeSprint) {
        setSelectedSprint(activeSprint._id);
      } else if (res.data.length > 0) {
        setSelectedSprint(res.data[0]._id);
      } else {
        setSelectedSprint("");
      }

    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      toast.error("Failed to fetch sprints");
    }
  };

  const fetchBacklog = async (projectId) => {
    try {
      const res = await api.get("/tickets", {
        params: {
          project_id: projectId,
          sprint_id: "none"
        }
      });

      setProductBacklog(res.data.tickets);

    } catch (error) {
      console.error("Failed to fetch product backlog:", error);
      toast.error("Failed to fetch product backlog");
    }
  };

  const fetchSprintBacklog = async (projectId, sprintId) => {
    try {
      const res = await api.get("/tickets", {
        params: {
          project_id: projectId,
          sprint_id: sprintId
        }
      });

      setSprintBacklog(res.data.tickets);

    } catch (error) {
      console.error("Failed to fetch sprint backlog:", error);
      toast.error("Failed to fetch sprint backlog");
    }
  };

  const refreshBacklogs = async () => {
    if (!selectedProject) {
      return;
    }

    await fetchBacklog(selectedProject._id);

    if (selectedSprint) {
      await fetchSprintBacklog(
        selectedProject._id,
        selectedSprint
      );
    }
  };

  const navigate = useNavigate();

    const handleSelectProject = (project) => {
    navigate(`/projects/${project.code}/backlog`);
    };

  const handleAddToSprint = async (ticketId) => {
    if (!selectedSprint) {
      toast.error("Please select a sprint");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/tickets/${ticketId}`, {
        sprint_id: selectedSprint
      });

      toast.success("Ticket added to sprint");

      await refreshBacklogs();

    } catch (error) {
      console.error("Failed to add ticket to sprint:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to add ticket to sprint"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSprint = async (ticketId) => {
    try {
      setLoading(true);

      await api.put(`/tickets/${ticketId}`, {
        sprint_id: null
      });

      toast.success("Ticket moved to product backlog");

      await refreshBacklogs();

    } catch (error) {
      console.error("Failed to remove ticket from sprint:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to remove ticket from sprint"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Story":
        return "var(--story)";
      case "Task":
        return "var(--task)";
      case "Bug":
        return "var(--bug)";
      default:
        return "var(--secondary)";
    }
  };

  const TicketCard = ({ ticket, type }) => {
    return (
      <div className="border border-border rounded-lg bg-background p-4">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-4 min-w-0">

            <div
              className="w-1.5 h-14 rounded-full shrink-0"
              style={{
                backgroundColor: getTypeColor(ticket.type)
              }}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">

                <span className="text-xs font-semibold text-primary">
                  {ticket.ticket_code}
                </span>

                <span
                  className="text-xs font-medium px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: getTypeColor(ticket.type)
                  }}
                >
                  {ticket.type}
                </span>

                <span className="text-xs text-muted-foreground">
                  {ticket.priority}
                </span>

              </div>

              <p className="font-medium mt-2 truncate">
                {ticket.title}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">

                <span>
                  {ticket.status}
                </span>

                <span>
                  {ticket.assignee_id?.full_name || "Unassigned"}
                </span>

              </div>
            </div>
          </div>

          {type === "product" ? (
            <Button
              size="sm"
              disabled={loading || !selectedSprint}
              onClick={() => handleAddToSprint(ticket._id)}
            >
              Add to Sprint
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => handleRemoveFromSprint(ticket._id)}
            >
              <RotateCcw className="size-4 mr-1" />
              Remove
            </Button>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <ProjectSidebar
        selectedProject={selectedProject}
        handleSelectProject={handleSelectProject}
        projectCode={projectCode}
        page="backlog"
        />

      <div className="flex-1 flex flex-col relative overflow-hidden">

        <div className="flex-1 w-full mx-auto px-8 pt-8 pb-8 overflow-x-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

            <div className="flex items-end justify-between gap-4 flex-1">
            <div>
                <h1 className="text-4xl font-bold text-primary">
                Backlog
                </h1>

                <p className="text-muted-foreground mt-2">
                Manage Product Backlog and Sprint Backlog
                </p>
            </div>

            <Button
                onClick={() =>
                navigate(`/projects/${projectCode}/board`)
                }
            >
                View Board
            </Button>
            </div>

            {selectedProject && (
              <div className="min-w-72">
                <label className="block text-sm font-medium mb-2">
                  Sprint
                </label>

                <select
                  value={selectedSprint}
                  onChange={(event) =>
                    setSelectedSprint(event.target.value)
                  }
                  className="w-full h-11 border border-border rounded-lg px-3 bg-card text-foreground"
                >
                  {sprints.length === 0 && (
                    <option value="">
                      No Sprint
                    </option>
                  )}

                  {sprints.map(sprint => (
                    <option
                      key={sprint._id}
                      value={sprint._id}
                    >
                      {sprint.name} - {sprint.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {!selectedProject ? (

            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Archive className="size-10 mx-auto text-primary mb-4" />

              <h2 className="text-lg font-semibold">
                Select a Project
              </h2>

              <p className="text-sm text-muted-foreground mt-2">
                Select a project to view its backlog.
              </p>
            </div>

          ) : (

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Product Backlog */}
              <div className="bg-card border border-border rounded-xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <div className="flex items-center gap-2">
                      <Archive className="size-5 text-primary" />

                      <h2 className="text-xl font-semibold">
                        Product Backlog
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      Tickets not assigned to a sprint
                    </p>
                  </div>

                  <div className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
                    {productBacklog.length}
                  </div>

                </div>

                <div className="space-y-3">

                  {productBacklog.map(ticket => (
                    <TicketCard
                      key={ticket._id}
                      ticket={ticket}
                      type="product"
                    />
                  ))}

                  {productBacklog.length === 0 && (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      Product Backlog is empty
                    </div>
                  )}

                </div>

              </div>

              {/* Sprint Backlog */}
              <div className="bg-card border border-border rounded-xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-5 text-primary" />

                      <h2 className="text-xl font-semibold">
                        Sprint Backlog
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      Tickets assigned to the selected sprint
                    </p>
                  </div>

                  <div className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
                    {sprintBacklog.length}
                  </div>

                </div>

                {!selectedSprint ? (

                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No sprint selected
                  </div>

                ) : (

                  <div className="space-y-3">

                    {sprintBacklog.map(ticket => (
                      <TicketCard
                        key={ticket._id}
                        ticket={ticket}
                        type="sprint"
                      />
                    ))}

                    {sprintBacklog.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground">
                        Sprint Backlog is empty
                      </div>
                    )}

                  </div>

                )}

              </div>

            </div>
          )}

        </div>

        <Footer />

      </div>

    </div>
  );
};

export default BacklogPage;