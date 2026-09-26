import React from 'react';
import { useNavigate } from "react-router";

const Header = ({ selectedProject }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2 text-center">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-4xl font-bold text-transparent bg-primary bg-clip-text"
      >
        Project Tracking System
      </button>
    </div>
  );
};

export default Header;