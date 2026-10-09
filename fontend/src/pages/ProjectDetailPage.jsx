
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  FolderKanban,
  Users,
  GitBranch,
  ListTodo,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Save,
  X,
  Plus,
Trash2,
Search
} from 'lucide-react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

import api from '@/lib/axios';
import ProjectSidebar from '@/components/ProjectSidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const ProjectDetailPage = () => {
  const { projectCode } = useParams();
  const navigate = useNavigate();
  const descriptionRef = useRef(null);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
const [showAddMember, setShowAddMember] = useState(false);
const [memberSearch, setMemberSearch] = useState("");
const [updatingMember, setUpdatingMember] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc"
  });
  const [pageSize, setPageSize] = useState(20);
const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    start_date: "",
    end_date: "",
    in_progress: "",
    testing: ""
  });

  useEffect(() => {
    fetchProject();
    setIsEditing(false);
  }, [projectCode]);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height =
        `${descriptionRef.current.scrollHeight}px`;
    }
  }, [formData.description, isEditing, project]);

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
    description: data.description || "",
    status: data.status || "Planning",
    start_date: toInputDate(data.start_date),
    end_date: toInputDate(data.end_date),
    in_progress: data.wip_limits?.in_progress ?? "",
    testing: data.wip_limits?.testing ?? ""
  });

  const fetchProject = async () => {
    try {
      setLoading(true);

      const projectsRes = await api.get("/projects");

      const selected = projectsRes.data.find(
        item => item.code === projectCode
      );

      if (!selected) {
        setProject(null);
        return;
      }

      const [projectRes, membersRes, sprintsRes, ticketsRes] =
        await Promise.all([
          api.get(`/projects/${selected._id}`),
          api.get(`/project-members/${selected._id}`),
          api.get("/sprints", {
            params: { project_id: selected._id }
          }),
          api.get("/tickets", {
            params: { project_id: selected._id }
          })
        ]);

      const projectData = projectRes.data;

      setProject(projectData);
      setMembers(membersRes.data);
      setSprints(sprintsRes.data);
      setTickets(ticketsRes.data.tickets || []);
      setFormData(getFormData(projectData));

    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("Failed to load project details");
      setProject(null);

    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (selected) => {
    if (selected.code !== projectCode) {
      navigate(`/projects/${selected.code}/board`);
    }
  };

  const canEditProject =
    currentUser?.user_type === "PM" &&
    String(getId(project?.created_by)) === String(currentUser?.id);
    const availableUsers = allUsers.filter(user =>
  user.role === "User" &&
  !members.some(member =>
    String(getId(member.user_id)) === String(user._id)
  ) &&
  (
    user.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(memberSearch.toLowerCase())
  )
);

const fetchMembers = async () => {
  const response = await api.get(`/project-members/${project._id}`);
  setMembers(response.data);
};

const handleOpenAddMember = async () => {
  if (!canEditProject || !isEditing) return;

  try {
    const response = await api.get("/users");

    setAllUsers(response.data);
    setMemberSearch("");
    setShowAddMember(true);
  } catch (error) {
    toast.error("Failed to load users");
  }
};

const handleAddMember = async (userId) => {
  if (!canEditProject || !isEditing || updatingMember) return;

  try {
    setUpdatingMember(true);

    await api.post("/project-members", {
      project_id: project._id,
      user_id: userId
    });

    await fetchMembers();

    toast.success("Member added successfully");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to add member"
    );
  } finally {
    setUpdatingMember(false);
  }
};

const handleRemoveMember = async (userId) => {
  if (!canEditProject || !isEditing || updatingMember) return;

  if (String(userId) === String(getId(project.created_by))) return;

  if (!window.confirm("Remove this member from the project?")) return;

  try {
    setUpdatingMember(true);

    await api.delete(
      `/project-members/${project._id}/${userId}`
    );

    await fetchMembers();

    toast.success("Member removed successfully");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to remove member"
    );
  } finally {
    setUpdatingMember(false);
  }
};

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData(getFormData(project));
    setIsEditing(false);
    setShowAddMember(false);
    setMemberSearch("");
  };

  const handleSave = async () => {
    if (!canEditProject || saving) return;

    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date > formData.end_date
    ) {
      toast.error("End date must be after start date");
      return;
    }

    const inProgress = Number(formData.in_progress);
    const testing = Number(formData.testing);

    if (
      formData.in_progress === "" ||
      formData.testing === "" ||
      !Number.isInteger(inProgress) ||
      !Number.isInteger(testing) ||
      inProgress < 0 ||
      testing < 0
    ) {
      toast.error("WIP Limits must be non-negative integers");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        wip_limits: {
          in_progress: inProgress,
          testing: testing
        }
      };

      await api.put(`/projects/${project._id}`, payload);

      toast.success("Project updated successfully");
      setIsEditing(false);
      await fetchProject();

    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error(
        error.response?.data?.message || "Failed to update project"
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
const totalPages = Math.max(
  1,
  Math.ceil(sortedTickets.length / pageSize)
);

const paginatedTickets = pageSize === "all"
  ? sortedTickets
  : sortedTickets.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
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
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-bold">
          Project Not Found
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
                disabled={!canEditProject}
                onClick={() => setIsEditing(true)}
                title={
                  canEditProject
                    ? "Edit Project"
                    : "Only the Project Manager can edit this project"
                }
              >
                <Pencil className="size-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>

          {/* Header */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 flex-wrap">

              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClass(project.status)}`}>
                {project.status}
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
                  {project.name}
                </h1>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-6 items-start">

            {/* Left Column */}
            <div className="min-w-0 space-y-6">

              {/* Description */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Description
                </h2>

                <textarea
                  ref={descriptionRef}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  rows={1}
                  placeholder="No description"
                  className={`w-full min-h-[42px] bg-background border border-border rounded-xl px-4 py-3 text-sm leading-6 resize-none overflow-hidden outline-none ${
                    isEditing
                      ? "focus:border-primary"
                      : "cursor-default"
                  }`}
                />
              </div>

              {/* Project Progress & Tickets */}
              <div className="bg-card border border-border rounded-xl p-6">

                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 className="size-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Project Progress
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
                      Project Tickets ({tickets.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full min-w-[1080px] text-sm text-left">
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
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Previous
                        </Button>

                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Page {currentPage} of {totalPages}
                        </span>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </Button>

                        </div>
                    )}

                    </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="min-w-0 space-y-6">

              {/* Project Information */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FolderKanban className="size-5 text-primary shrink-0" />

                  <h2 className="text-lg font-semibold">
                    Project Information
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

                    <InfoRow
                      label="Project Manager"
                      value={getUserName(project.created_by)}
                    />

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
                      value={project.status}
                    />

                    <InfoRow
                      label="Project Manager"
                      value={getUserName(project.created_by)}
                    />

                    <InfoRow
                      label="Start Date"
                      value={formatDate(project.start_date)}
                    />

                    <InfoRow
                      label="End Date"
                      value={formatDate(project.end_date)}
                    />
                  </div>
                )}

                {/* WIP Limits */}
                <div className="border-t border-border mt-4 pt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    WIP Limits
                  </h3>

                  {isEditing ? (
                    <div>
                      <EditRow label="In Progress">
                        <input
                          type="number"
                          min="0"
                          name="in_progress"
                          value={formData.in_progress}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </EditRow>

                      <EditRow label="Testing">
                        <input
                          type="number"
                          min="0"
                          name="testing"
                          value={formData.testing}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </EditRow>
                    </div>
                  ) : (
                    <div>
                      <InfoRow
                        label="In Progress"
                        value={project.wip_limits?.in_progress ?? "N/A"}
                      />

                      <InfoRow
                        label="Testing"
                        value={project.wip_limits?.testing ?? "N/A"}
                      />
                    </div>
                  )}
                </div>
              </div>


{/* Project Members */}
<div className="bg-card border border-border rounded-xl p-5">
  <div className="flex items-center justify-between gap-2 mb-4">
    <div className="flex items-center gap-2 min-w-0">
      <Users className="size-5 text-primary shrink-0" />

      <h2 className="text-lg font-semibold">
        Project Members ({members.length})
      </h2>
    </div>

    {isEditing && canEditProject && (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            if (showAddMember) {
              setShowAddMember(false);
            } else {
              handleOpenAddMember();
            }
          }}
          className="p-2 rounded-lg hover:bg-secondary text-primary"
          title="Add Member"
        >
          <Plus className="size-4" />
        </button>

        {showAddMember && (
          <div className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[85vw] bg-card border border-border rounded-xl shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Add Project Member
              </h3>

              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 border border-border rounded-lg px-3 mb-3">
              <Search className="size-4 text-muted-foreground shrink-0" />

              <input
                type="text"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search users..."
                className="w-full min-w-0 bg-transparent py-2 text-sm outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-border">
              {availableUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.full_name}
                    </p>

                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={updatingMember}
                    onClick={() => handleAddMember(user._id)}
                    className="shrink-0 p-2 rounded-lg text-primary hover:bg-secondary disabled:opacity-50"
                    title="Add Member"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              ))}

              {availableUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available users
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  <div className="overflow-x-auto border border-border rounded-xl">
    <table className="w-full text-xs text-left">
      <thead className="bg-secondary/50 border-b border-border">
        <tr>
          <th className="px-3 py-3 font-semibold">
            Type
          </th>

          <th className="px-3 py-3 font-semibold">
            Name
          </th>

          <th className="px-3 py-3 font-semibold">
            Email
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border">
        {members.map((member) => (
          <tr
            key={member._id}
            className="hover:bg-secondary/20"
          >
            <td className="px-3 py-3 align-top whitespace-nowrap">
              <span className="bg-secondary px-2 py-1 rounded-full">
                {member.user_id?.user_type || "N/A"}
              </span>
            </td>

            <td className="px-3 py-3 align-top font-medium">
              {member.user_id?.full_name || "Unknown User"}
            </td>

            <td className="px-3 py-3 align-top text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span className="break-all">
                  {member.user_id?.email || "N/A"}
                </span>

                {isEditing &&
                  canEditProject &&
                  String(getId(member.user_id)) !==
                    String(getId(project.created_by)) && (
                    <button
                      type="button"
                      disabled={updatingMember}
                      onClick={() =>
                        handleRemoveMember(getId(member.user_id))
                      }
                      className="shrink-0 text-muted-foreground hover:text-red-500 disabled:opacity-50"
                      title="Remove Member"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
              </div>
            </td>
          </tr>
        ))}

        {members.length === 0 && (
          <tr>
            <td
              colSpan={3}
              className="px-3 py-6 text-center text-muted-foreground"
            >
              No members found
            </td>
          </tr>
        )}
      </tbody>
    </table>
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

export default ProjectDetailPage;
