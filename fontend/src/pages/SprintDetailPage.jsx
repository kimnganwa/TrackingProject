
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  GitBranch,
  ListTodo,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

import api from '@/lib/axios';
import ProjectSidebar from '@/components/ProjectSidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const SprintDetailPage = () => {
  const { projectCode, sprintId } = useParams();
  const navigate = useNavigate();
  const goalRef = useRef(null);

  const [project, setProject] = useState(null);
  const [sprint, setSprint] = useState(null);
  const [members, setMembers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc"
  });

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    status: "Planning",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchSprint();
    setIsEditing(false);
    setCurrentPage(1);
  }, [projectCode, sprintId]);

  useEffect(() => {
    if (goalRef.current) {
      goalRef.current.style.height = "auto";
      goalRef.current.style.height =
        `${goalRef.current.scrollHeight}px`;
    }
  }, [formData.goal, isEditing, sprint]);

  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem("token");
      return token ? jwtDecode(token) : null;
    } catch (error) {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "object") {
      return value._id || value.id || null;
    }

    return value;
  };

  const getUserName = (value) => {
    if (!value) return "Unassigned";

    if (typeof value === "object") {
      return value.full_name || value.name || value.email || "N/A";
    }

    const member = members.find(
      item => String(getId(item.user_id)) === String(value)
    );

    return member?.user_id?.full_name || "N/A";
  };

  const toInputDate = (date) => {
    if (!date) return "";

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "";

    return value.toISOString().slice(0, 10);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "N/A";

    return value.toLocaleDateString("vi-VN");
  };

  const getFormData = (data) => ({
    name: data.name || "",
    goal: data.goal || "",
    status: data.status || "Planning",
    start_date: toInputDate(data.start_date),
    end_date: toInputDate(data.end_date)
  });

  const fetchSprint = async () => {
    try {
      setLoading(true);

      const projectsRes = await api.get("/projects");

      const selected = projectsRes.data.find(
        item => item.code === projectCode
      );

      if (!selected) {
        setProject(null);
        setSprint(null);
        return;
      }

      const [projectRes, sprintRes, membersRes, ticketsRes] =
        await Promise.all([
          api.get(`/projects/${selected._id}`),
          api.get(`/sprints/${sprintId}`),
          api.get(`/project-members/${selected._id}`),
          api.get("/tickets", {
            params: {
              project_id: selected._id,
              sprint_id: sprintId
            }
          })
        ]);

      const projectData = projectRes.data;
      const sprintData = sprintRes.data;

      if (
        String(getId(sprintData.project_id)) !==
        String(selected._id)
      ) {
        setProject(null);
        setSprint(null);
        return;
      }

      setProject(projectData);
      setSprint(sprintData);
      setMembers(membersRes.data);

      const sprintTickets = (ticketsRes.data.tickets || []).filter(
        ticket => String(getId(ticket.sprint_id)) === String(sprintId)
      );

      setTickets(sprintTickets);
      setFormData(getFormData(sprintData));

    } catch (error) {
      console.error("Failed to fetch sprint:", error);
      toast.error("Failed to load sprint details");
      setProject(null);
      setSprint(null);

    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (selected) => {
    if (selected.code !== projectCode) {
      navigate(`/projects/${selected.code}/board`);
    }
  };

  const canEditSprint =
    currentUser?.user_type === "PM" &&
    String(getId(project?.created_by)) === String(currentUser?.id) &&
    sprint?.status !== "Completed";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData(getFormData(sprint));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!canEditSprint || saving) return;

    if (!formData.name.trim()) {
      toast.error("Sprint name is required");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Start date and end date are required");
      return;
    }

    if (formData.start_date > formData.end_date) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        goal: formData.goal,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      await api.put(`/sprints/${sprint._id}`, payload);

      toast.success("Sprint updated successfully");
      setIsEditing(false);
      await fetchSprint();

    } catch (error) {
      console.error("Failed to update sprint:", error);
      toast.error(
        error.response?.data?.message || "Failed to update sprint"
      );

    } finally {
      setSaving(false);
    }
  };

  const completedTickets = tickets.filter(
    ticket => ticket.status === "Done"
  ).length;

  const progress = tickets.length
    ? Math.round((completedTickets / tickets.length) * 100)
    : 0;

  const statusOrder = {
    "To Do": 0,
    "In Progress": 1,
    "Testing": 2,
    "Done": 3
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc"
    }));

    setCurrentPage(1);
  };

  const getSortValue = (ticket, key) => {
    if (key === "status") {
      return statusOrder[ticket.status] ?? 99;
    }

    if (key === "reporter_id" || key === "assignee_id") {
      return getUserName(ticket[key]).toLowerCase();
    }

    if (key === "created_at" || key === "due_date") {
      if (!ticket[key]) return null;

      const date = new Date(ticket[key]).getTime();
      return Number.isNaN(date) ? null : date;
    }

    return ticket[key] || "";
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    let result = 0;

    if (
      typeof aValue === "number" &&
      typeof bValue === "number"
    ) {
      result = aValue - bValue;
    } else {
      result = String(aValue).localeCompare(String(bValue), "vi");
    }

    return sortConfig.direction === "asc" ? result : -result;
  });

  const totalPages = pageSize === "all"
    ? 1
    : Math.max(1, Math.ceil(sortedTickets.length / pageSize));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedTickets = pageSize === "all"
    ? sortedTickets
    : sortedTickets.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
      );

  const handlePageSizeChange = (event) => {
    const value = event.target.value;

    setPageSize(value === "all" ? "all" : Number(value));
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    if (status === "Done" || status === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "In Progress" || status === "Active") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "Testing") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-secondary text-secondary-foreground";
  };

  const SortHeader = ({ label, sortKey }) => {
    const isActive = sortConfig.key === sortKey;

    return (
      <button
        type="button"
        onClick={() => handleSort(sortKey)}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <span>{label}</span>

        {isActive ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5" />
        )}
      </button>
    );
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground shrink-0">
        {label}
      </span>

      <span className="text-sm font-semibold text-right break-words min-w-0">
        {value ?? "N/A"}
      </span>
    </div>
  );

  const inputClass =
    "w-full min-w-0 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary";

  const EditRow = ({ label, children }) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <label className="text-sm text-muted-foreground shrink-0">
        {label}
      </label>

      <div className="w-[58%] min-w-0">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        Loading sprint...
      </div>
    );
  }

  if (!project || !sprint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold">
          Sprint Not Found
        </h1>

        <Button onClick={() => navigate("/")}>
          Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-1">

        <ProjectSidebar
          selectedProject={project}
          handleSelectProject={handleSelectProject}
          projectCode={projectCode}
        />

        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8">

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate(`/projects/${project.code}/board`)}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Board
            </Button>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={saving}
                  onClick={handleCancel}
                >
                  <X className="size-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="rounded-xl"
                  disabled={saving}
                  onClick={handleSave}
                >
                  <Save className="size-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={!canEditSprint}
                onClick={() => setIsEditing(true)}
                title={
                  sprint.status === "Completed"
                    ? "Completed sprints cannot be edited"
                    : canEditSprint
                      ? "Edit Sprint"
                      : "Only the Project Manager can edit this sprint"
                }
              >
                <Pencil className="size-4 mr-2" />
                Edit Sprint
              </Button>
            )}
          </div>

          {/* Header */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 flex-wrap">

              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClass(sprint.status)}`}>
                {sprint.status}
              </span>

              <span className="text-lg font-bold text-primary">
                {project.code}
              </span>

              <span className="text-muted-foreground">·</span>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClass} flex-1 min-w-[180px] font-semibold`}
                />
              ) : (
                <h1 className="text-xl font-bold break-words">
                  {sprint.name}
                </h1>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-6 items-start">

            {/* Left Column */}
            <div className="min-w-0 space-y-6">

              {/* Sprint Goal */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Sprint Goal
                </h2>

                <textarea
                  ref={goalRef}
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  rows={1}
                  placeholder="No sprint goal"
                  className={`w-full min-h-[42px] bg-background border border-border rounded-xl px-4 py-3 text-sm leading-6 resize-none overflow-hidden outline-none ${
                    isEditing
                      ? "focus:border-primary"
                      : "cursor-default"
                  }`}
                />
              </div>

              {/* Sprint Progress & Tickets */}
              <div className="bg-card border border-border rounded-xl p-6">

                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 className="size-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Sprint Progress
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-5">
                  <InfoRow
                    label="Total Tickets"
                    value={tickets.length}
                  />

                  <InfoRow
                    label="Completed Tickets"
                    value={completedTickets}
                  />
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>Completion Rate</span>

                  <span className="font-semibold">
                    {progress}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Tickets Table */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ListTodo className="size-5 text-primary" />

                    <h3 className="text-lg font-semibold">
                      Sprint Tickets ({tickets.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full min-w-[850px] text-sm text-left">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">
                            Ticket Code
                          </th>

                          <th className="px-4 py-3 font-semibold min-w-[180px]">
                            Title
                          </th>

                          <th className="px-4 py-3 font-semibold">
                            <SortHeader
                              label="Status"
                              sortKey="status"
                            />
                          </th>

                          <th className="px-4 py-3 font-semibold">
                            <SortHeader
                              label="Reporter"
                              sortKey="reporter_id"
                            />
                          </th>

                          <th className="px-4 py-3 font-semibold">
                            <SortHeader
                              label="Assignee"
                              sortKey="assignee_id"
                            />
                          </th>

                          <th className="px-4 py-3 font-semibold">
                            <SortHeader
                              label="Due Date"
                              sortKey="due_date"
                            />
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {paginatedTickets.map((ticket) => (
                          <tr
                            key={ticket._id}
                            className="hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-4 py-4 align-top whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/ticket/${ticket.ticket_code}`)
                                }
                                className="font-semibold text-primary hover:underline"
                              >
                                {ticket.ticket_code}
                              </button>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <p className="font-medium line-clamp-2">
                                {ticket.title || "N/A"}
                              </p>
                            </td>

                            <td className="px-4 py-4 align-top whitespace-nowrap">
                              <span
                                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getStatusClass(ticket.status)}`}
                              >
                                {ticket.status}
                              </span>
                            </td>

                            <td className="px-4 py-4 align-top">
                              {getUserName(ticket.reporter_id)}
                            </td>

                            <td className="px-4 py-4 align-top">
                              {getUserName(ticket.assignee_id)}
                            </td>

                            <td className="px-4 py-4 align-top whitespace-nowrap text-muted-foreground">
                              {formatDate(ticket.due_date)}
                            </td>
                          </tr>
                        ))}

                        {tickets.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-muted-foreground"
                            >
                              No tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Show
                      </span>

                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value="all">All</option>
                      </select>

                      <span className="text-muted-foreground">
                        of {sortedTickets.length} tickets
                      </span>
                    </div>

                    {pageSize !== "all" && (
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={safePage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                          Previous
                        </Button>

                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Page {safePage} of {totalPages}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={safePage >= totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="min-w-0 space-y-6">

              {/* Sprint Information */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="size-5 text-primary shrink-0" />

                  <h2 className="text-lg font-semibold">
                    Sprint Information
                  </h2>
                </div>

                {isEditing ? (
                  <div>
                    <EditRow label="Status">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </EditRow>

                    <EditRow label="Start Date">
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </EditRow>

                    <EditRow label="End Date">
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </EditRow>
                  </div>
                ) : (
                  <div>
                    <InfoRow
                      label="Status"
                      value={sprint.status}
                    />

                    <InfoRow
                      label="Start Date"
                      value={formatDate(sprint.start_date)}
                    />

                    <InfoRow
                      label="End Date"
                      value={formatDate(sprint.end_date)}
                    />
                  </div>
                )}

                <div className="border-t border-border mt-4 pt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    Project
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/projects/${project.code}`)
                    }
                    className="text-sm font-medium text-primary hover:underline text-left"
                  >
                    {project.code} · {project.name}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SprintDetailPage;
