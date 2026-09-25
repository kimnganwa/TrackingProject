import React, { useState, useEffect } from 'react';
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { Button } from './ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';


const ProjectSidebar = ({ selectedProject, handleSelectProject,projectCode  }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

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


  return (
    <div className={`h-full bg-white min-h-screen border-r bg-muted/20 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16 p-2' : 'w-64 p-4'}`}>
      
      {/* Nút thu/mở Sidebar */}
      <div className={`flex items-center mt-2 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground size-8"
        >
          {isCollapsed ? <ArrowRightToLine className="size-5" /> : <ArrowLeftToLine className="size-5" />}
        </Button>
      </div>

      {/* List project */}
      <div className="space-y-2 mt-12">
        {projects.map((project) => (
          <div 
            key={project._id}
            onClick={() => {
              handleSelectProject(project);
              navigate(`/projects/${project.code}/board`);
            }}
            className={`rounded-lg cursor-pointer transition-colors border ${
              selectedProject?._id === project._id
                ? 'bg-accent border-primary'
                : 'bg-card hover:bg-accent'
            } ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}
            title={isCollapsed ? project.name : ""}
          >
            {isCollapsed ? (
              // Trạng thái thu gọn: Hiện field code (VD: PRJ-001)
              <p className="text-[10px] font-bold text-slate-800 break-all text-center">
                {project.code}
              </p>
            ) : (
              // Trạng thái mở rộng
              <>
                <p className="font-medium text-sm text-slate-800 line-clamp-2">{project.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {project.code}
                </p>
              </>
            )}
          </div>
        ))}
        
        {projects.length === 0 && !isCollapsed && (
          <p className="text-sm text-muted-foreground text-center mt-4">No projects found</p>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;