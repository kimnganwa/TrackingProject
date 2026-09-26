import React, { useState, useEffect } from 'react';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Plus,
  Pencil
} from 'lucide-react';
import { Button } from './ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import CreateProject from './CreateProject';
import EditProject from './EditProject';
import CreateSprint from './CreateSprint';
import EditSprint from './EditSprint';


const ProjectSidebar = ({
  selectedProject,
  handleSelectProject,
  projectCode
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [editSprint, setEditSprint] = useState(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;
  const isPM = currentUser?.user_type === "PM";


  useEffect(() => {
    fetchProjects();
  }, []);


  useEffect(() => {
    if (selectedProject?._id) {
      fetchSprints(selectedProject._id);
    } else {
      setSprints([]);
    }
  }, [selectedProject?._id]);


  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");

      setProjects(res.data);

      const selected = res.data.find(
        project => project.code === projectCode
      );

      if (selected) {
        handleSelectProject(selected);
      }

    } catch (error) {
      console.error("Error when access projects", error);
      toast.error("Error when access projects");
    }
  };


  const fetchSprints = async (projectId) => {
    try {
      const response = await api.get("/sprints", {
        params: {
          project_id: projectId
        }
      });

      setSprints(response.data.slice(0, 3));

    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      toast.error("Failed to load sprints");
    }
  };


  const createdById =
    selectedProject?.created_by?._id ||
    selectedProject?.created_by;

  const canManageSprint =
    isPM &&
    createdById === currentUser?.id;


  return (
    <>
      <div
        className={`self-stretch bg-card transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-16 p-2' : 'w-64 p-4'
        }`}
      >

        {/* Nút thu/mở Sidebar */}
        <div
          className={`flex items-center mt-2 ${
            isCollapsed ? 'justify-center' : 'justify-end'
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground size-8"
          >
            {isCollapsed ? (
              <ArrowRightToLine className="size-5" />
            ) : (
              <ArrowLeftToLine className="size-5" />
            )}
          </Button>
        </div>


        {/* Create Project */}
        {isPM && (
          <div
            className={`mt-6 ${
              isCollapsed ? "flex justify-center" : ""
            }`}
          >
            <Button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className={
                isCollapsed
                  ? "size-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  : "w-full bg-primary text-primary-foreground hover:bg-primary/90"
              }
              title="Create Project"
            >
              <Plus className="size-4" />

              {!isCollapsed && (
                <span>Create Project</span>
              )}
            </Button>
          </div>
        )}


        {/* List project */}
        <div className="space-y-2 mt-12">
          {projects.map((project) => {

            const projectCreatedById =
              project.created_by?._id ||
              project.created_by;

            const canEditProject =
              isPM &&
              projectCreatedById === currentUser?.id;

            return (
              <div
                key={project._id}
                onClick={() => {
                  handleSelectProject(project);
                  navigate(`/projects/${project.code}/board`);
                }}
                className={`rounded-lg cursor-pointer transition-all ${
                  selectedProject?._id === project._id
                    ? 'bg-secondary shadow-sm'
                    : 'bg-transparent hover:bg-card/60'
                } ${
                  isCollapsed
                    ? 'p-2 flex justify-center'
                    : 'p-3'
                }`}
                title={isCollapsed ? project.name : ""}
              >

                {isCollapsed ? (

                  <p className="text-[10px] font-bold text-slate-800 break-all text-center">
                    {project.code}
                  </p>

                ) : (

                  <div className="flex items-start justify-between gap-2">

                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-800 line-clamp-2">
                        {project.name}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {project.code}
                      </p>
                    </div>

                    {canEditProject && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditProject(project);
                        }}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary transition-colors"
                        title="Edit Project"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}

                  </div>
                )}

              </div>
            );
          })}


          {projects.length === 0 && !isCollapsed && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No projects found
            </p>
          )}
        </div>


        {/* Sprint */}
        {selectedProject && !isCollapsed && (
          <div className="mt-8 pt-5 border-t border-border">

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                Sprints
              </p>

              {canManageSprint && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowCreateSprint(true)}
                  className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-3.5" />
                  Sprint
                </Button>
              )}
            </div>


            <div className="space-y-2">
              {sprints.map((sprint) => (
                <div
                  key={sprint._id}
                  className={`rounded-lg border p-3 ${
                    sprint.status === "Active"
                      ? "border-primary bg-secondary"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sprint.name}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {sprint.status}
                      </span>
                    </div>


                    {canManageSprint && (
                      <button
                        type="button"
                        onClick={() => setEditSprint(sprint)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-primary transition-colors"
                        title="Edit Sprint"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}

                  </div>
                </div>
              ))}


              {sprints.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No sprints found
                </p>
              )}
            </div>

          </div>
        )}

      </div>


      {showCreateProject && (
        <CreateProject
          setShowModal={setShowCreateProject}
          handleProjectChange={fetchProjects}
        />
      )}


      {editProject && (
        <EditProject
          project={editProject}
          setShowModal={() => setEditProject(null)}
          handleProjectChange={fetchProjects}
        />
      )}


      {showCreateSprint && (
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


export default ProjectSidebar;