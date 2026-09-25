import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import Footer from '@/components/Footer';
import DashboardStats from '@/components/DashboardStats';
import TaskAging from '@/components/TaskAging';
import BottleneckPanel from '@/components/BottleneckPanel';
import TicketTypeChart from '@/components/TicketTypeChart';
import AssigneeChart from '@/components/AssigneeChart';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [activeSprint, setActiveSprint] = useState(null);

  const [averageCycleTime, setAverageCycleTime] = useState(null);
  const [averageLeadTime, setAverageLeadTime] = useState(null);
  const [throughput, setThroughput] = useState(0);
  const [taskAging, setTaskAging] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [sle, setSle] = useState(null);
  const [sprintTickets, setSprintTickets] = useState([]);
  const navigate = useNavigate();

  const currentProject = projects.find(
    project => project._id === selectedProject
  );
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchDashboard(selectedProject);
    } else {
      resetDashboard();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);

      if (res.data.length > 0) {
        setSelectedProject(res.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  const resetDashboard = () => {
    setActiveSprint(null);
    setAverageCycleTime(null);
    setAverageLeadTime(null);
    setThroughput(0);
    setTaskAging([]);
    setBottlenecks([]);
    setSle(null);
    setSprintTickets([]);
  };

  const fetchDashboard = async (projectId) => {
    try {
      resetDashboard();

      const sprintRes = await api.get("/sprints", {
        params: {
          project_id: projectId
        }
      });

      const sprint = sprintRes.data.find(
        sprint => sprint.status === "Active"
      );

      if (!sprint) {
        return;
      }

      setActiveSprint(sprint);

      const ticketsRes = await api.get("/tickets", {
        params: {
          project_id: projectId,
          sprint_id: sprint._id
        }
      });

      const tickets = ticketsRes.data.tickets;

      setSprintTickets(tickets);

      const completedTickets = tickets.filter(
        ticket => ticket.status === "Done"
      );

      const activeTickets = tickets.filter(
        ticket => ticket.status !== "Done"
      );

      const cycleTimeRequests = completedTickets.map(ticket =>
        api.get(`/tickets/${ticket._id}/cycle-time`)
      );

      const leadTimeRequests = completedTickets.map(ticket =>
        api.get(`/tickets/${ticket._id}/lead-time`)
      );

      const agingRequests = activeTickets.map(ticket =>
        api.get(`/tickets/${ticket._id}/task-aging`)
      );

      const [
        cycleTimeResponses,
        leadTimeResponses,
        agingResponses,
        throughputRes,
        bottleneckRes
      ] = await Promise.all([
        Promise.all(cycleTimeRequests),
        Promise.all(leadTimeRequests),
        Promise.all(agingRequests),
        api.get(`/sprints/${sprint._id}/throughput`),
        api.get(`/sprints/${sprint._id}/bottlenecks`)
      ]);

      const cycleTimes = cycleTimeResponses
        .map(response => response.data.cycle_time)
        .filter(value => value !== null);

      const leadTimes = leadTimeResponses
        .map(response => response.data.lead_time)
        .filter(value => value !== null);

      const averageCycle =
        cycleTimes.length > 0
          ? cycleTimes.reduce((sum, value) => sum + value, 0) /
            cycleTimes.length
          : null;

      const averageLead =
        leadTimes.length > 0
          ? leadTimes.reduce((sum, value) => sum + value, 0) /
            leadTimes.length
          : null;

      const agingData = activeTickets
        .map((ticket, index) => ({
          ...ticket,
          task_aging: agingResponses[index].data.task_aging
        }))
        .filter(ticket => ticket.task_aging !== null)
        .sort((a, b) => b.task_aging - a.task_aging);

      setAverageCycleTime(averageCycle);
      setAverageLeadTime(averageLead);
      setThroughput(throughputRes.data.throughput);
      setTaskAging(agingData);
      setBottlenecks(bottleneckRes.data.bottlenecks);
      setSle(bottleneckRes.data.sle);

    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      toast.error("Failed to fetch dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <div className="flex-1 w-full max-w-7xl mx-auto p-8">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Dashboard
            </h1>

            <p className="text-muted-foreground mt-2">
              Sprint performance and workflow metrics
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="block text-sm font-medium mb-2">
              Project
            </label>

            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="w-full h-11 border rounded-lg px-3 bg-white"
            >
              {projects.map(project => (
                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.code} - {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!activeSprint ? (
          <div className="border rounded-xl p-12 text-center bg-white shadow-sm">
            <h2 className="text-lg font-semibold">
              No Active Sprint
            </h2>

            <p className="text-sm text-muted-foreground mt-2">
              This project currently has no active sprint.
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-xl p-5 mb-6 bg-white shadow-sm">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-xs text-muted-foreground uppercase">
        Active Sprint
      </p>

      <h2 className="text-xl font-semibold mt-1">
        {activeSprint.name}
      </h2>

      {activeSprint.goal && (
        <p className="text-sm text-muted-foreground mt-1">
          {activeSprint.goal}
        </p>
      )}
    </div>

    <Button
      onClick={() =>
        navigate(`/projects/${currentProject.code}/board`)
      }
    >
      View Board
    </Button>
  </div>
</div>

            <DashboardStats
              averageCycleTime={averageCycleTime}
              averageLeadTime={averageLeadTime}
              throughput={throughput}
              sle={sle}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <TicketTypeChart tickets={sprintTickets} />

              <AssigneeChart tickets={sprintTickets} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <TaskAging tickets={taskAging} />

              <BottleneckPanel
                bottlenecks={bottlenecks}
                sle={sle}
              />
            </div>
          </>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;