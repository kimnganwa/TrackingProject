import React from 'react';

const ProjectSidebar = () => {
  // TODO: Tạm thời mock data UI, sau này làm BE xong nhớ gọi API fetch danh sách project đổ vào đây
  const mockProjects = [
    { project_id: 'P01', name: 'E-Commerce App' },
    { project_id: 'P02', name: 'Task Manager' },
    { project_id: 'P03', name: 'Portfolio' },
  ];

  return (
    <div className="w-64 h-full min-h-screen border-r p-4 bg-muted/20">
      <h2 className="text-lg font-bold mb-4 text-foreground">Projects</h2>
      <div className="space-y-2">
        {mockProjects.map((project) => (
          <div 
            key={project.project_id}
            className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors border bg-card"
          >
            <p className="font-medium text-sm">{project.name}</p>
            <p className="text-xs text-muted-foreground">ID: {project.project_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSidebar;