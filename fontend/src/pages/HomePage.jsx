import AddTicket from '@/components/AddTicket';
import Footer from '@/components/Footer';
import StartAndFilter from '@/components/StartAndFilter';
import Header from '@/components/Header';
import TicketList from '@/components/TicketList';
import TicketListPagination from '@/components/TicketListPagination';
import DateTimeFilter from '@/components/DateTimeFilter';
import ProjectSidebar from '@/components/ProjectSidebar'; // Nhớ import thêm cái này
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useParams, useNavigate  } from 'react-router';
import { jwtDecode } from "jwt-decode";



const HomePage = () => {
  const [ticketBuffer, setTicketBuffer] = useState([]);
  const [activeTicketCount, setActiveTicketCount] = useState(0);
  const [completeTicketCount, setCompleteTicketCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const { projectCode } = useParams();
  const navigate = useNavigate();
  const [activeSprint, setActiveSprint] = useState(null);
  const [myTicketsOnly, setMyTicketsOnly] = useState(false);
  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;    

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      const projects = response.data;

      if (projects.length === 0) {
        setSelectedProject(null);
        setActiveSprint(null);
        setTicketBuffer([]);
        return;
      }

      const savedProject = localStorage.getItem("selectedProject");

      const project = projects.find(
        item => item.code === projectCode
      ) || projects.find(
        item => item._id === savedProject
      ) || projects[0];

      await handleSelectProject(project);

      if (project.code !== projectCode) {
        navigate(`/projects/${project.code}/board`, { replace: true });
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    }
  };

  fetchProjects();
}, [projectCode]);

  //Logic
  const fetchTicket = async (projectId = null) => {
  try {
    const res = await api.get("/tickets", {
      params: projectId ? { project_id: projectId } : {},
    });

    setTicketBuffer(res.data.tickets);
    setActiveTicketCount(res.data.activeCount);
    setCompleteTicketCount(res.data.completeCount);

  } catch (error) {
    console.error("Error when access tickets", error);
    toast.error("Error when access tickets", { id: "fetch-error" });
  }
};

  const handleTicketChange = () => {
  fetchTicket(selectedProject?._id);
}
  
  //Filter 
const boardTickets = ticketBuffer.filter((ticket) => {
  if (ticket.sprint_id && ticket.sprint_id !== activeSprint?._id) {
    return false;
  }

  if (myTicketsOnly) {
    const assigneeId = ticket.assignee_id?._id || ticket.assignee_id;
    const reporterId = ticket.reporter_id?._id || ticket.reporter_id;

    return assigneeId === currentUser?.id || reporterId === currentUser?.id;
  }

  return true;
});
  
    const handleSelectProject = async (project) => {
  setSelectedProject(project);
  localStorage.setItem("selectedProject", project._id);

  try {
    const sprintRes = await api.get("/sprints", {
      params: {
        project_id: project._id
      }
    });

    const sprint = sprintRes.data.find(
      sprint => sprint.status === "Active"
    );

    setActiveSprint(sprint || null);

    fetchTicket(project._id);

  } catch (error) {
    console.error("Failed to fetch active sprint:", error);
    toast.error("Failed to fetch active sprint");
  }
};
  return (
    <div className="flex min-h-screen">
      {/* Cột trái: Sidebar Project */}
      <ProjectSidebar
        selectedProject={selectedProject}
        handleSelectProject={handleSelectProject}
        projectCode={projectCode}
      />

      {/* Cột phải: Main Board */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 w-full mx-auto space-y-6 px-8 pt-8 pb-2 overflow-x-auto">
          {/* Đầu trang */}
          <Header selectedProject={selectedProject} />

          {/* Tạo ticket */}
          <AddTicket 
            handleNewTicket={handleTicketChange}
            selectedProject={selectedProject}
            activeSprint={activeSprint}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            />

          {/* Thống kê và bộ lọc */}
          <StartAndFilter
            myTicketsOnly={myTicketsOnly}
            setMyTicketsOnly={setMyTicketsOnly}
            activeTicketsCount={activeTicketCount}
            completedTicketsCount={completeTicketCount}
          />
          
          {/* Danh sách ticket */}
          <TicketList
            filterTicket={boardTickets}
            handleTicketChange={handleTicketChange}
            activeSprint={activeSprint}
          />

          {/* Phân trang lọc theo ngày */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row mt-8">
            <TicketListPagination />
            <DateTimeFilter />
          </div>
        </div>

        {/* Chân trang */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;