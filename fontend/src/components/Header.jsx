import React from 'react' 
 
const Header = ({ selectedProject }) => { 
  return ( 
    <div className="space-y-2 text-center"> 
      <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">
        {selectedProject ? selectedProject.name : "Project Tracking"}
      </h1>

      {selectedProject && (
        <p className="text-sm text-muted-foreground font-bold">
          {selectedProject.code}
        </p>
      )}
    </div> 
  ) 
} 
 
export default Header