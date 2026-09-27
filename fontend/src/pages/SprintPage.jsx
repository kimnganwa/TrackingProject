import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import {
  CalendarDays,
  CircleCheckBig,
  Clock3,
  Pencil,
  Plus
} from 'lucide-react';

import api from '@/lib/axios';
import Footer from '@/components/Footer';
import ProjectSidebar from '@/components/ProjectSidebar';
import CreateSprint from '@/components/CreateSprint';
import EditSprint from '@/components/EditSprint';
import { Button } from '@/components/ui/button';

const SprintPage = () => {
  const { projectCode } = useParams();
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [editSprint, setEditSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;
  const isPM = currentUser?.user_type === "PM";

  const createdById =
    selectedProject?.created_by?._id ||
    selectedProject?.created_by;

  const canManageSprint =
    isPM &&
    createdById === currentUser?.id;

  useEffect(() => {
    fetchCurrentProject();
  }, [projectCode]);

  const fetchCurrentProject = async () => {
    try {
      setLoading(true);

      const res = await api.get("/projects");

      const project = res.data.find(
        project => project.code === projectCode
      );

      if (!project) {
        setSelectedProject(null);
        setSprints([]);
        toast.error("Project not found");
        return;
      }

      setSelectedProject(project);

      await fetchSprints(project._id);

    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
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

    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      toast.error("Failed to fetch sprints");
    }
  };

  const handleSelectProject = (project) => {
    navigate(`/projects/${project.code}/sprints`);
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-primary text-primary-foreground";

      case "Completed":
        return "bg-accent text-accent-foreground";

      case "Planning":
        return "bg-secondary text-secondary-foreground";

      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const planningSprints = sprints.filter(
    sprint => sprint.status === "Planning"
  );

  const activeSprints = sprints.filter(
    sprint => sprint.status === "Active"
  );

  const completedSprints = sprints.filter(
    sprint => sprint.status === "Completed"
  );

  const SprintCard = ({ sprint }) => {
    return (
      <div className="bg-background border border-border rounded-xl p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="flex items-center gap-3 flex-wrap">

              <h3 className="text-lg font-semibold text-foreground">
                {sprint.name}
              </h3>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
                  sprint.status
                )}`}
              >
                {sprint.status}
              </span>

            </div>

            {sprint.goal && (
              <p className="text-sm text-muted-foreground mt-2">
                {sprint.goal}
              </p>
            )}

          </div>

          {canManageSprint && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setEditSprint(sprint)}
              title="Edit Sprint"
            >
              <Pencil className="size-4" />
            </Button>
          )}

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

          <div className="bg-card rounded-lg p-3">

            <p className="text-xs text-muted-foreground">
              Start Date
            </p>

            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="size-4 text-primary" />

              <span className="text-sm font-medium">
                {formatDate(sprint.start_date)}
              </span>
            </div>

          </div>

          <div className="bg-card rounded-lg p-3">

            <p className="text-xs text-muted-foreground">
              End Date
            </p>

            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="size-4 text-primary" />

              <span className="text-sm font-medium">
                {formatDate(sprint.end_date)}
              </span>
            </div>

          </div>

        </div>

        <div className="flex items-center justify-end gap-2 mt-5">

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/projects/${projectCode}/backlog`
              )
            }
          >
            View Backlog
          </Button>

          {sprint.status === "Active" && (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                navigate(
                  `/projects/${projectCode}/board`
                )
              }
            >
              View Board
            </Button>
          )}

        </div>

      </div>
    );
  };

  const SprintSection = ({
    title,
    description,
    icon,
    sprints
  }) => {
    return (
      <div className="bg-card border border-border rounded-xl p-6">

        <div className="flex items-center justify-between gap-4 mb-5">

          <div>
            <div className="flex items-center gap-2">

              {icon}

              <h2 className="text-xl font-semibold">
                {title}
              </h2>

            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>

          <div className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
            {sprints.length}
          </div>

        </div>

        <div className="space-y-4">

          {sprints.map(sprint => (
            <SprintCard
              key={sprint._id}
              sprint={sprint}
            />
          ))}

          {sprints.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              No sprints
            </p>
          )}

        </div>

      </div>
    );
  };

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">

        <ProjectSidebar
          selectedProject={selectedProject}
          handleSelectProject={handleSelectProject}
          projectCode={projectCode}
          page="sprints"
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">

          <div className="flex-1 w-full mx-auto px-8 pt-8 pb-8 overflow-x-auto">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

              <div>

                <h1 className="text-4xl font-bold text-primary">
                  Sprints
                </h1>

                <p className="text-muted-foreground mt-2">
                  Manage sprint planning and sprint lifecycle
                </p>

                {selectedProject && (
                  <p className="text-sm font-medium mt-2">
                    {selectedProject.code} - {selectedProject.name}
                  </p>
                )}

              </div>

              {selectedProject && (
                <div className="flex items-center gap-3 flex-wrap">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/projects/${projectCode}/backlog`
                      )
                    }
                  >
                    View Backlog
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/projects/${projectCode}/board`
                      )
                    }
                  >
                    View Board
                  </Button>

                  {canManageSprint && (
                    <Button
                      type="button"
                      onClick={() =>
                        setShowCreateSprint(true)
                      }
                    >
                      <Plus className="size-4" />
                      Create Sprint
                    </Button>
                  )}

                </div>
              )}

            </div>

            {loading ? (

              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Loading sprints...
                </p>
              </div>

            ) : !selectedProject ? (

              <div className="bg-card border border-border rounded-xl p-12 text-center">

                <CalendarDays className="size-10 mx-auto text-primary mb-4" />

                <h2 className="text-lg font-semibold">
                  Project Not Found
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  The selected project could not be found.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <SprintSection
                  title="Planning"
                  description="Sprints being prepared"
                  icon={
                    <Clock3 className="size-5 text-primary" />
                  }
                  sprints={planningSprints}
                />

                <SprintSection
                  title="Active"
                  description="Sprint currently in progress"
                  icon={
                    <CalendarDays className="size-5 text-primary" />
                  }
                  sprints={activeSprints}
                />

                <SprintSection
                  title="Completed"
                  description="Finished sprints"
                  icon={
                    <CircleCheckBig className="size-5 text-primary" />
                  }
                  sprints={completedSprints}
                />

              </div>
            )}

          </div>

          <Footer />

        </div>

      </div>

      {showCreateSprint && selectedProject && (
        <CreateSprint
          project={selectedProject}
          setShowModal={setShowCreateSprint}
          handleSprintChange={() =>
            fetchSprints(selectedProject._id)
          }
        />
      )}

      {editSprint && (
        <EditSprint
          sprint={editSprint}
          setShowModal={() => setEditSprint(null)}
          handleSprintChange={() =>
            fetchSprints(selectedProject._id)
          }
        />
      )}

    </>
  );
};

export default SprintPage;