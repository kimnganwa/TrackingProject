import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gauge,
  Timer,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/axios';
import Footer from '@/components/Footer';
import ProjectSidebar from '@/components/ProjectSidebar';
import { Button } from '@/components/ui/button';

const AnalyticsPage = () => {
  const { projectCode } = useParams();
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState(null);

  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketMetrics, setTicketMetrics] = useState([]);
  const [taskAging, setTaskAging] = useState([]);

  const [throughput, setThroughput] = useState(0);
  const [sle, setSle] = useState(0);
  const [bottlenecks, setBottlenecks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentProject();
  }, [projectCode]);

  useEffect(() => {
    if (selectedSprint && selectedProject) {
      fetchAnalytics(selectedSprint);
    }
  }, [selectedSprint, selectedProject]);

  const fetchCurrentProject = async () => {
    try {
      setLoading(true);

      const projectRes = await api.get("/projects");

      const project = projectRes.data.find(
        project => project.code === projectCode
      );

      if (!project) {
        setSelectedProject(null);
        toast.error("Project not found");
        return;
      }

      setSelectedProject(project);

      const sprintRes = await api.get("/sprints", {
        params: {
          project_id: project._id
        }
      });

      setSprints(sprintRes.data);

      const activeSprint = sprintRes.data.find(
        sprint => sprint.status === "Active"
      );

      if (activeSprint) {
        setSelectedSprint(activeSprint._id);
      } else if (sprintRes.data.length > 0) {
        setSelectedSprint(sprintRes.data[0]._id);
      } else {
        setSelectedSprint("");
      }

    } catch (error) {
      console.error("Failed to fetch analytics project:", error);
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (sprintId) => {
    try {
      setMetricsLoading(true);

      setTickets([]);
      setTicketMetrics([]);
      setTaskAging([]);
      setThroughput(0);
      setSle(0);
      setBottlenecks([]);

      const ticketsRes = await api.get("/tickets", {
        params: {
          project_id: selectedProject._id,
          sprint_id: sprintId
        }
      });

      const sprintTickets = ticketsRes.data.tickets || [];

      setTickets(sprintTickets);

      const completedTickets = sprintTickets.filter(
        ticket => ticket.status === "Done"
      );

      const activeTickets = sprintTickets.filter(
        ticket =>
          ticket.status === "In Progress" ||
          ticket.status === "Testing"
      );

      const completedMetrics = await Promise.all(
        completedTickets.map(async ticket => {
          try {
            const [cycleRes, leadRes] = await Promise.all([
              api.get(`/tickets/${ticket._id}/cycle-time`),
              api.get(`/tickets/${ticket._id}/lead-time`)
            ]);

            return {
              _id: ticket._id,
              ticket_code: ticket.ticket_code,
              title: ticket.title,
              cycle_time: cycleRes.data.cycle_time,
              lead_time: leadRes.data.lead_time
            };

          } catch (error) {
            console.error(
              `Failed to fetch metrics for ${ticket.ticket_code}:`,
              error
            );

            return null;
          }
        })
      );

      setTicketMetrics(
        completedMetrics.filter(metric => metric !== null)
      );

      const agingMetrics = await Promise.all(
        activeTickets.map(async ticket => {
          try {
            const agingRes = await api.get(
              `/tickets/${ticket._id}/task-aging`
            );

            return {
              _id: ticket._id,
              ticket_code: ticket.ticket_code,
              title: ticket.title,
              status: ticket.status,
              task_aging: agingRes.data.task_aging
            };

          } catch (error) {
            console.error(
              `Failed to fetch task aging for ${ticket.ticket_code}:`,
              error
            );

            return null;
          }
        })
      );

      setTaskAging(
        agingMetrics.filter(metric => metric !== null)
      );

      const [throughputRes, bottleneckRes] =
        await Promise.all([
          api.get(`/sprints/${sprintId}/throughput`),
          api.get(`/sprints/${sprintId}/bottlenecks`)
        ]);

      setThroughput(
        throughputRes.data.throughput || 0
      );

      setBottlenecks(
        bottleneckRes.data.bottlenecks || []
      );

      setSle(
        bottleneckRes.data.sle || 0
      );

    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleSelectProject = (project) => {
  navigate(`/projects/${project.code}/analytics`);
};

const formatDateTime = (date) => {
  if (!date) {
    return "N/A";
  }

  return new Date(date).toLocaleString("vi-VN");
};

const formatDuration = (milliseconds) => {
  if (
    milliseconds === null ||
    milliseconds === undefined ||
    Number.isNaN(Number(milliseconds))
  ) {
    return "N/A";
  }

  const totalMinutes = Math.floor(
    Number(milliseconds) / (1000 * 60)
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};

const getAverage = (values) => {
  const validValues = values
    .map(value => Number(value))
    .filter(value => !Number.isNaN(value));

  if (validValues.length === 0) {
    return null;
  }

  return (
    validValues.reduce(
      (total, value) => total + value,
      0
    ) / validValues.length
  );
};


  const getMinimum = (values) => {
    const validValues = values
      .map(value => Number(value))
      .filter(value => !Number.isNaN(value));

    if (validValues.length === 0) {
      return null;
    }

    return Math.min(...validValues);
  };

  const getMaximum = (values) => {
    const validValues = values
      .map(value => Number(value))
      .filter(value => !Number.isNaN(value));

    if (validValues.length === 0) {
      return null;
    }

    return Math.max(...validValues);
  };

  const cycleTimes = ticketMetrics.map(
    metric => metric.cycle_time
  );

  const leadTimes = ticketMetrics.map(
    metric => metric.lead_time
  );

  const averageCycleTime = getAverage(cycleTimes);
  const minimumCycleTime = getMinimum(cycleTimes);
  const maximumCycleTime = getMaximum(cycleTimes);

  const averageLeadTime = getAverage(leadTimes);
  const minimumLeadTime = getMinimum(leadTimes);
  const maximumLeadTime = getMaximum(leadTimes);

  const selectedSprintData = sprints.find(
    sprint => sprint._id === selectedSprint
  );

  const totalTickets = tickets.length;

  const doneTickets = tickets.filter(
    ticket => ticket.status === "Done"
  ).length;

  const inProgressTickets = tickets.filter(
    ticket => ticket.status === "In Progress"
  ).length;

  const testingTickets = tickets.filter(
    ticket => ticket.status === "Testing"
  ).length;

  const toDoTickets = tickets.filter(
    ticket => ticket.status === "To Do"
  ).length;

  const completionRate =
    totalTickets > 0
      ? Math.round(
          (doneTickets / totalTickets) * 100
        )
      : 0;

  const maxMetricValue = Math.max(
    ...ticketMetrics.flatMap(metric => [
      Number(metric.cycle_time) || 0,
      Number(metric.lead_time) || 0,
      Number(sle) || 0
    ]),
    1
  );

  const getSlePercentage = (value) => {
    if (!sle || Number(sle) === 0) {
      return 0;
    }

    return Math.round(
      (Number(value) / Number(sle)) * 100
    );
  };

  const OverviewCard = ({
    title,
    value,
    icon
  }) => {
    return (
      <div className="bg-background border border-border rounded-xl p-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-muted-foreground">
              {title}
            </p>

            <p className="text-2xl font-bold mt-1">
              {value}
            </p>
          </div>

          <div className="text-primary">
            {icon}
          </div>

        </div>

      </div>
    );
  };

  const StatisticBox = ({
    label,
    value
  }) => {
    return (
      <div className="bg-background border border-border rounded-lg p-3">

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="font-semibold mt-1">
          {formatDuration(value)}
        </p>

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
          page="analytics"
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">

          <div className="flex-1 w-full mx-auto px-8 pt-8 pb-8 overflow-x-auto">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

              <div>

                <h1 className="text-4xl font-bold text-primary">
                  Analytics
                </h1>

                <p className="text-muted-foreground mt-2">
                  Detailed Sprint performance and workflow analysis
                </p>

                {selectedProject && (
                  <p className="text-sm font-medium mt-2">
                    {selectedProject.code} - {selectedProject.name}
                  </p>
                )}

              </div>

              {selectedProject && (
                <div className="flex items-center gap-3">

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

                </div>
              )}

            </div>

            {loading ? (

              <div className="bg-card border border-border rounded-xl p-12 text-center">
                Loading analytics...
              </div>

            ) : !selectedProject ? (

              <div className="bg-card border border-border rounded-xl p-12 text-center">

                <BarChart3 className="size-10 mx-auto text-primary mb-4" />

                <h2 className="text-lg font-semibold">
                  Project Not Found
                </h2>

              </div>

            ) : sprints.length === 0 ? (

              <div className="bg-card border border-border rounded-xl p-12 text-center">

                <BarChart3 className="size-10 mx-auto text-primary mb-4" />

                <h2 className="text-lg font-semibold">
                  No Sprints
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  Create a Sprint to start collecting analytics.
                </p>

              </div>

            ) : (

              <>

                {/* Sprint selection */}

                <div className="bg-card border border-border rounded-xl p-5 mb-6">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <h2 className="text-lg font-semibold">
                        Sprint Analysis
                      </h2>

                      <p className="text-sm text-muted-foreground mt-1">
                        Select a Sprint to analyze its workflow performance.
                      </p>

                    </div>

                    <select
                      value={selectedSprint}
                      onChange={event =>
                        setSelectedSprint(
                          event.target.value
                        )
                      }
                      className="bg-background border border-border rounded-lg px-4 py-2.5 min-w-[250px] outline-none"
                    >

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

                  {selectedSprintData && (

                    <div className="flex items-center gap-3 mt-4">

                      <span className="font-medium">
                        {selectedSprintData.name}
                      </span>

                      <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                        {selectedSprintData.status}
                      </span>

                    </div>

                  )}

                </div>

                {metricsLoading ? (

                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    Loading Sprint metrics...
                  </div>

                ) : (

                  <>

                    {/* Sprint Overview */}

                    <div className="bg-card border border-border rounded-xl p-6 mb-6">

                      <div className="flex items-center gap-2 mb-1">

                        <Activity className="size-5 text-primary" />

                        <h2 className="text-xl font-semibold">
                          Sprint Overview
                        </h2>

                      </div>

                      <p className="text-sm text-muted-foreground mb-5">
                        Current work distribution and Sprint completion
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

                        <OverviewCard
                          title="Total"
                          value={totalTickets}
                          icon={
                            <BarChart3 className="size-5" />
                          }
                        />

                        <OverviewCard
                          title="To Do"
                          value={toDoTickets}
                          icon={
                            <CircleDot className="size-5" />
                          }
                        />

                        <OverviewCard
                          title="In Progress"
                          value={inProgressTickets}
                          icon={
                            <Activity className="size-5" />
                          }
                        />

                        <OverviewCard
                          title="Testing"
                          value={testingTickets}
                          icon={
                            <Gauge className="size-5" />
                          }
                        />

                        <OverviewCard
                          title="Done"
                          value={doneTickets}
                          icon={
                            <CheckCircle2 className="size-5" />
                          }
                        />

                        <OverviewCard
                          title="Completion"
                          value={`${completionRate}%`}
                          icon={
                            <TrendingUp className="size-5" />
                          }
                        />

                      </div>

                      <div className="mt-5">

                        <div className="flex items-center justify-between text-xs mb-2">

                          <span>
                            Sprint Completion
                          </span>

                          <span className="font-semibold">
                            {doneTickets} / {totalTickets}
                          </span>

                        </div>

                        <div className="h-3 bg-background rounded-full overflow-hidden">

                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${completionRate}%`
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    {/* Cycle Time and Lead Time */}

                    <div className="bg-card border border-border rounded-xl p-6 mb-6">

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">

                        <div>

                          <div className="flex items-center gap-2">

                            <Timer className="size-5 text-primary" />

                            <h2 className="text-xl font-semibold">
                              Cycle Time & Lead Time Analysis
                            </h2>

                          </div>

                          <p className="text-sm text-muted-foreground mt-1">
                            Detailed duration analysis for completed Tickets
                          </p>

                        </div>

                        <div className="bg-background border border-border rounded-lg px-4 py-2">

                          <p className="text-xs text-muted-foreground">
                            SLE (P85)
                          </p>

                          <p className="font-semibold text-primary">
                            {formatDuration(sle)}
                          </p>

                        </div>

                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">

                        <div className="border border-border rounded-xl p-4">

                          <h3 className="font-semibold mb-4">
                            Cycle Time
                          </h3>

                          <div className="grid grid-cols-3 gap-3">

                            <StatisticBox
                              label="Average"
                              value={averageCycleTime}
                            />

                            <StatisticBox
                              label="Minimum"
                              value={minimumCycleTime}
                            />

                            <StatisticBox
                              label="Maximum"
                              value={maximumCycleTime}
                            />

                          </div>

                        </div>

                        <div className="border border-border rounded-xl p-4">

                          <h3 className="font-semibold mb-4">
                            Lead Time
                          </h3>

                          <div className="grid grid-cols-3 gap-3">

                            <StatisticBox
                              label="Average"
                              value={averageLeadTime}
                            />

                            <StatisticBox
                              label="Minimum"
                              value={minimumLeadTime}
                            />

                            <StatisticBox
                              label="Maximum"
                              value={maximumLeadTime}
                            />

                          </div>

                        </div>

                      </div>

                      {ticketMetrics.length === 0 ? (

                        <p className="text-sm text-muted-foreground text-center py-10">
                          No completed Ticket metrics
                        </p>

                      ) : (

                        <div className="space-y-6">

                          {ticketMetrics.map(metric => {

                            const cyclePercentage =
                              getSlePercentage(
                                metric.cycle_time
                              );

                            return (

                              <div
                                key={metric._id}
                                className="bg-background border border-border rounded-xl p-4"
                              >

                                <div className="flex items-start justify-between gap-4 mb-4">

                                  <div>

                                    <p className="font-semibold">
                                      {metric.ticket_code}
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-1">
                                      {metric.title}
                                    </p>

                                  </div>

                                  {sle > 0 && (
                                    <span
                                      className={
                                        cyclePercentage >= 100
                                          ? "text-xs font-semibold text-destructive"
                                          : "text-xs font-semibold text-primary"
                                      }
                                    >
                                      {cyclePercentage}% SLE
                                    </span>
                                  )}

                                </div>

                                <div className="space-y-3">

                                  <div className="flex items-center gap-3">

                                    <span className="text-xs w-20">
                                      Cycle
                                    </span>

                                    <div className="flex-1 h-3 bg-card rounded-full overflow-hidden">

                                      <div
                                        className={
                                          cyclePercentage >= 100
                                            ? "h-full bg-destructive rounded-full"
                                            : "h-full bg-primary rounded-full"
                                        }
                                        style={{
                                          width: `${Math.min(
                                            (
                                              Number(
                                                metric.cycle_time
                                              ) /
                                              maxMetricValue
                                            ) * 100,
                                            100
                                          )}%`
                                        }}
                                      />

                                    </div>

                                    <span className="text-xs font-medium w-20 text-right">
                                      {formatDuration(
                                        metric.cycle_time
                                      )}
                                    </span>

                                  </div>

                                  <div className="flex items-center gap-3">

                                    <span className="text-xs w-20">
                                      Lead
                                    </span>

                                    <div className="flex-1 h-3 bg-card rounded-full overflow-hidden">

                                      <div
                                        className="h-full bg-accent rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (
                                              Number(
                                                metric.lead_time
                                              ) /
                                              maxMetricValue
                                            ) * 100,
                                            100
                                          )}%`
                                        }}
                                      />

                                    </div>

                                    <span className="text-xs font-medium w-20 text-right">
                                      {formatDuration(
                                        metric.lead_time
                                      )}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            );
                          })}

                        </div>

                      )}

                    </div>

                    {/* Task Aging */}

                    <div className="bg-card border border-border rounded-xl p-6 mb-6">

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">

                        <div>

                          <div className="flex items-center gap-2">

                            <Clock3 className="size-5 text-primary" />

                            <h2 className="text-xl font-semibold">
                              Task Aging Analysis
                            </h2>

                          </div>

                          <p className="text-sm text-muted-foreground mt-1">
                            Active Tickets compared with the Sprint SLE
                          </p>

                        </div>

                        <div className="bg-background border border-border rounded-lg px-4 py-2">

                          <p className="text-xs text-muted-foreground">
                            SLE Threshold
                          </p>

                          <p className="font-semibold">
                            {formatDuration(sle)}
                          </p>

                        </div>

                      </div>

                      {taskAging.length === 0 ? (

                        <p className="text-sm text-muted-foreground text-center py-10">
                          No active Ticket aging data
                        </p>

                      ) : (

                        <div className="space-y-4">

                          {taskAging.map(metric => {

                            const aging =
                              Number(
                                metric.task_aging
                              ) || 0;

                            const percentage =
                              getSlePercentage(aging);

                            const reachedSle =
                              Number(sle) > 0 &&
                              aging >= Number(sle);

                            return (

                              <div
                                key={metric._id}
                                className="bg-background border border-border rounded-xl p-4"
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>

                                    <div className="flex items-center gap-2 flex-wrap">

                                      <p className="font-semibold">
                                        {metric.ticket_code}
                                      </p>

                                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                        {metric.status}
                                      </span>

                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1">
                                      {metric.title}
                                    </p>

                                  </div>

                                  <div className="text-right">

                                    <p className="font-semibold">
                                      {formatDuration(
                                        metric.task_aging
                                      )}
                                    </p>

                                    {sle > 0 && (
                                      <p
                                        className={
                                          reachedSle
                                            ? "text-xs text-destructive font-semibold mt-1"
                                            : "text-xs text-muted-foreground mt-1"
                                        }
                                      >
                                        {percentage}% SLE
                                      </p>
                                    )}

                                  </div>

                                </div>

                                {sle > 0 && (

                                  <div className="mt-4">

                                    <div className="h-3 bg-card rounded-full overflow-hidden">

                                      <div
                                        className={
                                          reachedSle
                                            ? "h-full bg-destructive rounded-full"
                                            : "h-full bg-primary rounded-full"
                                        }
                                        style={{
                                          width: `${Math.min(
                                            percentage,
                                            100
                                          )}%`
                                        }}
                                      />

                                    </div>

                                    {reachedSle && (

                                      <div className="flex items-center gap-2 mt-3 text-destructive">

                                        <AlertTriangle className="size-4" />

                                        <span className="text-xs font-medium">
                                          Task Aging has reached or exceeded SLE
                                        </span>

                                      </div>

                                    )}

                                  </div>

                                )}

                              </div>

                            );
                          })}

                        </div>

                      )}

                    </div>

                    {/* Bottleneck */}

                    <div className="bg-card border border-border rounded-xl p-6">

                      <div className="flex items-center gap-2">

                        <AlertTriangle className="size-5 text-primary" />

                        <h2 className="text-xl font-semibold">
                          Bottleneck Analysis
                        </h2>

                      </div>

                      <p className="text-sm text-muted-foreground mt-1 mb-6">
                        Detailed workflow analysis using WIP Limit, Task Aging and SLE
                      </p>

                      {bottlenecks.length === 0 ? (

                        <div className="bg-background border border-border rounded-xl p-8 text-center">

                          <CheckCircle2 className="size-9 text-primary mx-auto mb-3" />

                          <p className="font-semibold">
                            No bottlenecks detected
                          </p>

                          <p className="text-sm text-muted-foreground mt-2">
                            Current workflow does not meet the bottleneck conditions.
                          </p>

                        </div>

                      ) : (

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                          {bottlenecks.map(
                            (bottleneck, index) => {

                              const wipUsage =
                                bottleneck.wip_limit > 0
                                  ? Math.round(
                                      (
                                        bottleneck.current_wip /
                                        bottleneck.wip_limit
                                      ) * 100
                                    )
                                  : 0;

                              return (

                                <div
                                  key={`${bottleneck.status}-${index}`}
                                  className="bg-background border border-destructive rounded-xl p-5"
                                >

                                  <div className="flex items-center justify-between gap-4">

                                    <div className="flex items-center gap-2">

                                      <AlertTriangle className="size-5 text-destructive" />

                                      <h3 className="text-lg font-semibold">
                                        {bottleneck.status}
                                      </h3>

                                    </div>

                                    <span className="text-xs font-semibold text-destructive">
                                      Bottleneck Detected
                                    </span>

                                  </div>

                                  <div className="grid grid-cols-3 gap-3 mt-5">

                                    <div className="bg-card rounded-lg p-3">

                                      <p className="text-xs text-muted-foreground">
                                        Current WIP
                                      </p>

                                      <p className="text-xl font-bold mt-1">
                                        {bottleneck.current_wip}
                                      </p>

                                    </div>

                                    <div className="bg-card rounded-lg p-3">

                                      <p className="text-xs text-muted-foreground">
                                        WIP Limit
                                      </p>

                                      <p className="text-xl font-bold mt-1">
                                        {bottleneck.wip_limit}
                                      </p>

                                    </div>

                                    <div className="bg-card rounded-lg p-3">

                                      <p className="text-xs text-muted-foreground">
                                        WIP Usage
                                      </p>

                                      <p className="text-xl font-bold mt-1">
                                        {wipUsage}%
                                      </p>

                                    </div>

                                  </div>

                                  <div className="mt-4">

                                    <div className="flex justify-between text-xs mb-2">

                                      <span>
                                        WIP Usage
                                      </span>

                                      <span>
                                        {bottleneck.current_wip} / {bottleneck.wip_limit}
                                      </span>

                                    </div>

                                    <div className="h-3 bg-card rounded-full overflow-hidden">

                                      <div
                                        className="h-full bg-destructive rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            wipUsage,
                                            100
                                          )}%`
                                        }}
                                      />

                                    </div>

                                  </div>

                                  {bottleneck.aging_tickets?.length > 0 && (

                                    <div className="mt-5">

                                        <p className="text-sm font-semibold mb-3">
                                        Tickets Causing Bottleneck
                                        </p>

                                        <div className="space-y-3">

                                        {bottleneck.aging_tickets.map(ticket => {

                                            const percentage =
                                            getSlePercentage(ticket.task_aging);

                                            const exceededTime =
                                            Number(ticket.task_aging) - Number(sle);

                                            return (

                                            <div
                                                key={ticket.ticket_id}
                                                className="bg-card border border-border rounded-xl p-4"
                                            >

                                                <div className="flex items-start justify-between gap-4">

                                                <div>

                                                    <div className="flex items-center gap-2 flex-wrap">

                                                    <p className="font-semibold">
                                                        {ticket.ticket_code}
                                                    </p>

                                                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                                        {ticket.status}
                                                    </span>

                                                    </div>

                                                    <p className="text-sm text-muted-foreground mt-1">
                                                    {ticket.title}
                                                    </p>

                                                </div>

                                                <div className="text-right">

                                                    <p className="font-semibold text-destructive">
                                                    {formatDuration(ticket.task_aging)}
                                                    </p>

                                                    <p className="text-xs text-destructive mt-1">
                                                    {percentage}% SLE
                                                    </p>

                                                </div>

                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                                                <div className="bg-background border border-border rounded-lg p-3">

                                                    <p className="text-xs text-muted-foreground">
                                                    Created At
                                                    </p>

                                                    <p className="text-sm font-medium mt-1">
                                                    {formatDateTime(ticket.created_at)}
                                                    </p>

                                                </div>

                                                <div className="bg-background border border-border rounded-lg p-3">

                                                    <p className="text-xs text-muted-foreground">
                                                    In Progress Since
                                                    </p>

                                                    <p className="text-sm font-medium mt-1">
                                                    {formatDateTime(ticket.in_progress_at)}
                                                    </p>

                                                </div>

                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">

                                                <div className="bg-background border border-border rounded-lg p-3">

                                                    <p className="text-xs text-muted-foreground">
                                                    Task Aging
                                                    </p>

                                                    <p className="text-sm font-semibold mt-1">
                                                    {formatDuration(ticket.task_aging)}
                                                    </p>

                                                </div>

                                                <div className="bg-background border border-border rounded-lg p-3">

                                                    <p className="text-xs text-muted-foreground">
                                                    SLE
                                                    </p>

                                                    <p className="text-sm font-semibold mt-1">
                                                    {formatDuration(sle)}
                                                    </p>

                                                </div>

                                                <div className="bg-background border border-border rounded-lg p-3">

                                                    <p className="text-xs text-muted-foreground">
                                                    Exceeded SLE By
                                                    </p>

                                                    <p className="text-sm font-semibold text-destructive mt-1">
                                                    {formatDuration(exceededTime)}
                                                    </p>

                                                </div>

                                                </div>

                                                <div className="mt-4">

                                                <div className="flex items-center justify-between text-xs mb-2">

                                                    <span>
                                                    SLE Usage
                                                    </span>

                                                    <span className="font-semibold text-destructive">
                                                    {percentage}%
                                                    </span>

                                                </div>

                                                <div className="h-3 bg-background rounded-full overflow-hidden">

                                                    <div
                                                    className="h-full bg-destructive rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                        percentage,
                                                        100
                                                        )}%`
                                                    }}
                                                    />

                                                </div>

                                                </div>

                                            </div>

                                            );
                                        })}

                                        </div>

                                    </div>

                                    )}

                                  <div className="mt-5 border border-destructive rounded-lg p-4">

                                    <p className="text-sm font-semibold text-destructive">
                                      Why was this bottleneck detected?
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-2">
                                      WIP has reached its configured limit and at least one Ticket has a Task Aging greater than or equal to the Sprint SLE.
                                    </p>

                                  </div>

                                </div>

                              );
                            }
                          )}

                        </div>

                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                        <div className="bg-background border border-border rounded-lg p-4">

                          <p className="text-xs text-muted-foreground">
                            Throughput
                          </p>

                          <p className="text-xl font-bold mt-1">
                            {throughput}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Completed Tickets
                          </p>

                        </div>

                        <div className="bg-background border border-border rounded-lg p-4">

                          <p className="text-xs text-muted-foreground">
                            SLE
                          </p>

                          <p className="text-xl font-bold mt-1">
                            {formatDuration(sle)}
                          </p>
                            
                          <p className="text-xs text-muted-foreground mt-1">
                            P85 Cycle Time
                          </p>

                        </div>

                        <div className="bg-background border border-border rounded-lg p-4">

                          <p className="text-xs text-muted-foreground">
                            Bottlenecks
                          </p>

                          <p className="text-xl font-bold mt-1">
                            {bottlenecks.length}
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Detected workflow states
                          </p>

                        </div>

                      </div>

                    </div>

                  </>

                )}

              </>

            )}

          </div>

          <Footer />

        </div>

      </div>
    </>
  );
};

export default AnalyticsPage;