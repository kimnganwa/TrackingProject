import React from 'react';
import { useNavigate } from 'react-router';
import { FolderKanban } from 'lucide-react';

const ProjectProgress = ({ projects, tickets }) => {
  const navigate = useNavigate();

  const getProjectProgress = (projectId) => {
    const projectTickets = tickets.filter(
      ticket => ticket.project_id?._id === projectId
    );

    if (projectTickets.length === 0) {
      return 0;
    }

    const completedTickets = projectTickets.filter(
      ticket => ticket.status === "Done"
    ).length;

    return Math.round(
      (completedTickets / projectTickets.length) * 100
    );
  };

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white h-full">

      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Project Progress
        </h2>

        <p className="text-sm text-muted-foreground">
          Progress of your projects
        </p>
      </div>

      <div className="space-y-5">
        {projects.map((project) => {
          const progress = getProjectProgress(project._id);

          return (
            <div
              key={project._id}
              onClick={() =>
                navigate(`/projects/${project.code}/board`)
              }
              className="border rounded-lg p-4 cursor-pointer hover:bg-muted/40 transition-colors"
            >

              <div className="flex items-center justify-between mb-3">

                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="size-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {project.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {project.code}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold">
                  {progress}%
                </span>

              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

            </div>
          );
        })}

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No projects found
          </p>
        )}
      </div>

    </div>
  );
};

export default ProjectProgress;