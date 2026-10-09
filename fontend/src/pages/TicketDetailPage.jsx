import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  CircleDot,
  FolderKanban,
  GitBranch,
  Link2,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/axios';
import ProjectSidebar from '@/components/ProjectSidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TicketDetailPage = () => {
  const { ticketCode } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [projectTickets, setProjectTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [addingRelation, setAddingRelation] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [activeTab, setActiveTab] = useState("comment");

  const [comment, setComment] = useState("");

  const [showRelationForm, setShowRelationForm] = useState(false);

  const [relationForm, setRelationForm] = useState({
    relation_type: "RELATES_TO",
    target_id: ""
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    assignee_id: "",
    due_date: ""
  });

  useEffect(() => {
    fetchTicket();
  }, [ticketCode]);

  const fetchTicket = async () => {
    try {
      setLoading(true);

      const projectsRes = await api.get("/projects");

      let foundTicket = null;
      let foundProjectTickets = [];

      for (const project of projectsRes.data) {
        const ticketsRes = await api.get("/tickets", {
          params: {
            project_id: project._id
          }
        });

        const tickets =
          ticketsRes.data.tickets || [];

        const matchedTicket = tickets.find(
          item =>
            item.ticket_code === ticketCode
        );

        if (matchedTicket) {
          foundTicket = matchedTicket;
          foundProjectTickets = tickets;
          break;
        }
      }

      if (!foundTicket) {
        setTicket(null);
        return;
      }

      const ticketRes = await api.get(
        `/tickets/${foundTicket._id}`
      );

      const ticketData = ticketRes.data;

      setTicket(ticketData);
      setProjectTickets(foundProjectTickets);

      setFormData({
        title: ticketData.title || "",
        description: ticketData.description || "",
        priority: ticketData.priority || "",
        status: ticketData.status || "",
        assignee_id:
          ticketData.assignee_id?._id || "",
        due_date: ticketData.due_date
          ? new Date(ticketData.due_date)
              .toISOString()
              .split("T")[0]
          : ""
      });

      if (ticketData.project_id?._id) {
        await fetchProjectUsers(
          ticketData.project_id._id
        );
      }

      await fetchActivities(
        ticketData._id
      );

    } catch (error) {
      console.error(
        "Failed to fetch ticket:",
        error
      );

      toast.error("Failed to fetch ticket");
      setTicket(null);

    } finally {
      setLoading(false);
    }
  };

  const fetchProjectUsers = async (projectId) => {
    try {
      const response = await api.get(
        `/project-members/${projectId}`
      );

      const members = response.data;

      const projectUsers = members
        .map(member => member.user_id)
        .filter(Boolean);

      setUsers(projectUsers);

    } catch (error) {
      console.error(
        "Failed to fetch project users:",
        error
      );

      setUsers([]);
    }
  };

  const fetchActivities = async (ticketId) => {
    try {
      const response = await api.get(
        `/tickets/${ticketId}/activities`
      );

      setActivities(response.data);

    } catch (error) {
      console.error(
        "Failed to fetch activities:",
        error
      );

      setActivities([]);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!ticket?._id) {
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/tickets/${ticket._id}`,
        {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          assignee_id:
            formData.assignee_id || null,
          due_date:
            formData.due_date || null
        }
      );

      toast.success(
        "Ticket updated successfully"
      );

      setEditingField(null);

      await fetchTicket();

    } catch (error) {
      console.error(
        "Failed to update ticket:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update ticket"
      );

    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      return;
    }

    try {
      setAddingComment(true);

      await api.post(
        `/tickets/${ticket._id}/activities`,
        {
          activity_type: "COMMENT",
          content: comment.trim()
        }
      );

      setComment("");

      await fetchActivities(
        ticket._id
      );

      toast.success(
        "Comment added successfully"
      );

    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to add comment"
      );

    } finally {
      setAddingComment(false);
    }
  };

  const handleAddRelation = async () => {
    if (!relationForm.target_id) {
      toast.error("Please select a Ticket");
      return;
    }

    try {
      setAddingRelation(true);

      await api.post(
        `/tickets/${ticket._id}/relations`,
        {
          target_id:
            relationForm.target_id,
          relation_type:
            relationForm.relation_type
        }
      );

      setRelationForm({
        relation_type: "RELATES_TO",
        target_id: ""
      });

      setShowRelationForm(false);

      toast.success(
        "Relation added successfully"
      );

      await fetchTicket();

    } catch (error) {
      console.error(
        "Failed to add relation:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to add relation"
      );

    } finally {
      setAddingRelation(false);
    }
  };

  const handleRemoveRelation = async (
    targetId
  ) => {
    try {
      await api.delete(
        `/tickets/${ticket._id}/relations/${targetId}`
      );

      toast.success(
        "Relation removed successfully"
      );

      await fetchTicket();

    } catch (error) {
      console.error(
        "Failed to remove relation:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to remove relation"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "vi-VN"
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString(
      "vi-VN"
    );
  };

  const getTypeClass = (type) => {
    if (type === "Story") {
      return "bg-[var(--story)]";
    }

    if (type === "Bug") {
      return "bg-[var(--bug)]";
    }

    return "bg-[var(--task)]";
  };

  const getPriorityClass = (priority) => {
    if (
      priority === "Critical" ||
      priority === "High"
    ) {
      return "text-destructive";
    }

    return "text-foreground";
  };

  const handleBackToBoard = () => {
    if (!ticket?.project_id?.code) {
      navigate("/");
      return;
    }

    navigate(
      `/projects/${ticket.project_id.code}/board`
    );
  };

const handleSelectProject = (project) => {
  if (project._id !== ticket?.project_id?._id) {
    navigate(`/projects/${project.code}/board`);
  }
};

  const handleRelationClick = (relation) => {
    const target = relation.target_id;

    if (!target?.ticket_code) {
      return;
    }

    navigate(
      `/ticket/${target.ticket_code}`
    );
  };

  const handleParentClick = () => {
    if (!ticket.parent_id?.ticket_code) {
      return;
    }

    navigate(
      `/ticket/${ticket.parent_id.ticket_code}`
    );
  };

  const existingRelationIds =
    ticket?.relations?.map(
      relation =>
        relation.target_id?._id
    ) || [];

  const availableRelationTickets =
    projectTickets.filter(
      item =>
        item._id !== ticket?._id &&
        !existingRelationIds.includes(
          item._id
        )
    );

  const comments = activities.filter(
    activity =>
      activity.activity_type === "COMMENT"
  );

  const activityHistory = activities.filter(
    activity =>
      activity.activity_type !== "COMMENT"
  );

  const displayedActivities =
    activeTab === "all"
      ? activities
      : activeTab === "comment"
        ? comments
        : activityHistory;

  const getActivityTitle = (activity) => {
    switch (activity.activity_type) {
      case "STATUS_CHANGE":
        return "Status changed";

      case "REASSIGN":
        return "Ticket reassigned";

      case "UPDATE_INFO":
        return "Ticket information updated";

      case "COMMENT":
        return "Comment";

      default:
        return activity.activity_type;
    }
  };

  const EditableItem = ({
    label,
    field,
    icon,
    children
  }) => {
    const isEditing =
      editingField === field;

    return (
      <div
        className={`bg-background border rounded-xl p-4 transition-colors ${
          isEditing
            ? "border-primary"
            : "border-border hover:border-primary/60"
        }`}
      >

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2 text-muted-foreground">

            {icon}

            <p className="text-xs">
              {label}
            </p>

          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() =>
                setEditingField(field)
              }
              className="text-muted-foreground hover:text-primary"
            >
              <Pencil className="size-3.5" />
            </button>
          )}

        </div>

        <div className="mt-2">
          {children}
        </div>

      </div>
    );
  };

  const InfoItem = ({
    label,
    value,
    icon
  }) => {
    return (
      <div className="bg-background border border-border rounded-xl p-4">

        <div className="flex items-center gap-2 text-muted-foreground">

          {icon}

          <p className="text-xs">
            {label}
          </p>

        </div>

        <p className="font-semibold mt-2">
          {value || "N/A"}
        </p>

      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">

        <div className="bg-card border border-border rounded-xl p-10 text-center">

          <h1 className="text-2xl font-bold">
            Ticket Not Found
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            {ticketCode}
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() => navigate("/")}
          >
            Back Home
          </Button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="flex flex-1">

        {/* Sidebar */}

        <ProjectSidebar
          selectedProject={ticket.project_id}
          handleSelectProject={handleSelectProject}
          projectCode={ticket.project_id?.code}
        />

        {/* Content */}

        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8">

          {/* Actions */}

          <div className="flex items-center justify-between gap-4 mb-6">

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToBoard}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Board
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="size-4 mr-2" />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

          {/* Header */}

          <div className="bg-card border border-border rounded-xl p-6 mb-6">

            <div className="flex items-center gap-3 flex-wrap">

              <span className="text-lg font-bold text-primary">
                {ticket.ticket_code}
              </span>

              <span
                className={`text-xs font-semibold text-foreground px-3 py-1 rounded-full ${getTypeClass(
                  ticket.type
                )}`}
              >
                {ticket.type}
              </span>

              <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                {formData.status}
              </span>

              <span
                className={`text-xs font-semibold ${getPriorityClass(
                  formData.priority
                )}`}
              >
                {formData.priority} Priority
              </span>

            </div>

            {editingField === "title" ? (

              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                autoFocus
                className="mt-4 text-xl font-bold"
              />

            ) : (

              <div
                className="group flex items-start gap-3 mt-4 cursor-pointer"
                onClick={() =>
                  setEditingField("title")
                }
              >

                <h1 className="text-3xl font-bold">
                  {formData.title}
                </h1>

                <Pencil className="size-4 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100" />

              </div>

            )}

            <p className="text-sm text-muted-foreground mt-2">
              {ticket.project_id?.code} - {ticket.project_id?.name}
            </p>

          </div>

          {/* Main Grid */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* Description */}

            <div className="bg-card border border-border rounded-xl p-6 h-full">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Description
                </h2>

                {editingField !== "description" && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingField(
                        "description"
                      )
                    }
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="size-4" />
                  </button>
                )}

              </div>

              {editingField === "description" ? (

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  autoFocus
                  rows={10}
                  className="mt-4 w-full bg-background border border-primary rounded-xl p-4 text-sm outline-none resize-y"
                />

              ) : (

                <div
                  onClick={() =>
                    setEditingField(
                      "description"
                    )
                  }
                  className="mt-4 bg-background border border-border rounded-xl p-5 min-h-[280px] cursor-pointer hover:border-primary/60"
                >

                  {formData.description ? (

                    <p className="text-sm whitespace-pre-wrap leading-6">
                      {formData.description}
                    </p>

                  ) : (

                    <p className="text-sm text-muted-foreground">
                      Click to add description
                    </p>

                  )}

                </div>

              )}

            </div>

            {/* Ticket Information */}

            <div className="bg-card border border-border rounded-xl p-6 h-full">

              <div className="flex items-center gap-2 mb-5">

                <CircleDot className="size-5 text-primary" />

                <h2 className="text-xl font-semibold">
                  Ticket Information
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <EditableItem
                  label="Status"
                  field="status"
                  icon={
                    <CircleDot className="size-4" />
                  }
                >
                  {editingField === "status" ? (

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      autoFocus
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none"
                    >
                      <option value="To Do">
                        To Do
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Testing">
                        Testing
                      </option>

                      <option value="Done">
                        Done
                      </option>
                    </select>

                  ) : (

                    <p
                      className="font-semibold cursor-pointer"
                      onClick={() =>
                        setEditingField("status")
                      }
                    >
                      {formData.status}
                    </p>

                  )}
                </EditableItem>

                <EditableItem
                  label="Priority"
                  field="priority"
                  icon={
                    <CircleDot className="size-4" />
                  }
                >
                  {editingField === "priority" ? (

                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      autoFocus
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none"
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Critical">
                        Critical
                      </option>
                    </select>

                  ) : (

                    <p
                      className={`font-semibold cursor-pointer ${getPriorityClass(
                        formData.priority
                      )}`}
                      onClick={() =>
                        setEditingField(
                          "priority"
                        )
                      }
                    >
                      {formData.priority}
                    </p>

                  )}
                </EditableItem>

                <EditableItem
                  label="Assignee"
                  field="assignee_id"
                  icon={
                    <User className="size-4" />
                  }
                >
                  {editingField === "assignee_id" ? (

                    <select
                      name="assignee_id"
                      value={formData.assignee_id}
                      onChange={handleChange}
                      autoFocus
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none"
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {users.map(user => (
                        <option
                          key={user._id}
                          value={user._id}
                        >
                          {user.full_name}
                        </option>
                      ))}

                    </select>

                  ) : (

                    <p
                      className="font-semibold cursor-pointer"
                      onClick={() =>
                        setEditingField(
                          "assignee_id"
                        )
                      }
                    >
                      {
                        users.find(
                          user =>
                            user._id ===
                            formData.assignee_id
                        )?.full_name ||
                        ticket.assignee_id
                          ?.full_name ||
                        "Unassigned"
                      }
                    </p>

                  )}
                </EditableItem>

                <InfoItem
                  label="Reporter"
                  value={
                    ticket.reporter_id?.full_name ||
                    "N/A"
                  }
                  icon={
                    <Users className="size-4" />
                  }
                />

                <EditableItem
                  label="Due Date"
                  field="due_date"
                  icon={
                    <CalendarDays className="size-4" />
                  }
                >
                  {editingField === "due_date" ? (

                    <Input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      autoFocus
                    />

                  ) : (

                    <p
                      className="font-semibold cursor-pointer"
                      onClick={() =>
                        setEditingField(
                          "due_date"
                        )
                      }
                    >
                      {formData.due_date
                        ? formatDate(
                            formData.due_date
                          )
                        : "No due date"}
                    </p>

                  )}
                </EditableItem>

                <InfoItem
                  label="Created At"
                  value={formatDateTime(
                    ticket.created_at
                  )}
                  icon={
                    <CalendarDays className="size-4" />
                  }
                />

              </div>

            </div>

            {/* Relations */}

            <div className="bg-card border border-border rounded-xl p-6 h-full">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-2">

                  <Link2 className="size-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Relations
                  </h2>

                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setShowRelationForm(
                      prev => !prev
                    )
                  }
                >
                  {showRelationForm ? (
                    <X className="size-4 mr-1" />
                  ) : (
                    <Plus className="size-4 mr-1" />
                  )}

                  {showRelationForm
                    ? "Cancel"
                    : "Add Relation"}
                </Button>

              </div>

              {showRelationForm && (

                <div className="mt-5 bg-background border border-border rounded-xl p-4">

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 items-end">

                    <div>

                      <label className="text-xs text-muted-foreground">
                        Relation Type
                      </label>

                      <select
                        value={
                          relationForm.relation_type
                        }
                        onChange={(event) =>
                          setRelationForm(
                            prev => ({
                              ...prev,
                              relation_type:
                                event.target.value
                            })
                          )
                        }
                        className="w-full mt-2 bg-background border border-border rounded-md px-3 py-2 text-sm outline-none"
                      >
                        <option value="RELATES_TO">
                          RELATES_TO
                        </option>

                        <option value="BLOCKS">
                          BLOCKS
                        </option>
                      </select>

                    </div>

                    <div>

                      <label className="text-xs text-muted-foreground">
                        Ticket
                      </label>

                      <select
                        value={
                          relationForm.target_id
                        }
                        onChange={(event) =>
                          setRelationForm(
                            prev => ({
                              ...prev,
                              target_id:
                                event.target.value
                            })
                          )
                        }
                        className="w-full mt-2 bg-background border border-border rounded-md px-3 py-2 text-sm outline-none"
                      >
                        <option value="">
                          Select Ticket
                        </option>

                        {availableRelationTickets.map(
                          item => (
                            <option
                              key={item._id}
                              value={item._id}
                            >
                              {item.ticket_code} - {item.title}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <Button
                      type="button"
                      onClick={handleAddRelation}
                      disabled={
                        addingRelation ||
                        !relationForm.target_id
                      }
                    >
                      <Plus className="size-4 mr-1" />

                      {addingRelation
                        ? "Adding..."
                        : "Add"}
                    </Button>

                  </div>

                </div>

              )}

              <div className="mt-5">

                {!ticket.relations ||
                ticket.relations.length === 0 ? (

                  <div className="bg-background border border-border rounded-xl p-8 text-center">

                    <Link2 className="size-8 mx-auto text-muted-foreground mb-3" />

                    <p className="text-sm text-muted-foreground">
                      No related Tickets
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {ticket.relations.map(
                      (relation, index) => {

                        const target =
                          relation.target_id;

                        return (

                          <div
                            key={
                              target?._id ||
                              `${relation.relation_type}-${index}`
                            }
                            className="bg-background border border-border rounded-xl p-4"
                          >

                            <div className="flex items-center justify-between gap-4">

                              <button
                                type="button"
                                onClick={() =>
                                  handleRelationClick(
                                    relation
                                  )
                                }
                                className="flex-1 text-left"
                              >

                                <div className="flex items-center gap-2 flex-wrap">

                                  <span className="text-xs font-semibold text-primary">
                                    {relation.relation_type}
                                  </span>

                                  <span className="font-semibold hover:text-primary hover:underline">
                                    {target?.ticket_code}
                                  </span>

                                  {target?.type && (
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${getTypeClass(
                                        target.type
                                      )}`}
                                    >
                                      {target.type}
                                    </span>
                                  )}

                                </div>

                                <p className="text-sm text-muted-foreground mt-2">
                                  {target?.title}
                                </p>

                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveRelation(
                                    target?._id
                                  )
                                }
                                className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-4" />
                              </button>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* Planning */}

            <div className="bg-card border border-border rounded-xl p-6 h-full">

              <div className="flex items-center gap-2 mb-5">

                <FolderKanban className="size-5 text-primary" />

                <h2 className="text-xl font-semibold">
                  Planning
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <InfoItem
                  label="Project"
                  value={
                    ticket.project_id
                      ? `${ticket.project_id.code} - ${ticket.project_id.name}`
                      : "N/A"
                  }
                  icon={
                    <FolderKanban className="size-4" />
                  }
                />

                <InfoItem
                  label="Sprint"
                  value={
                    ticket.sprint_id?.name ||
                    "Product Backlog"
                  }
                  icon={
                    <CalendarDays className="size-4" />
                  }
                />

                <InfoItem
                  label="Epic"
                  value={
                    ticket.epic_id
                      ? `${ticket.epic_id.epic_code} - ${ticket.epic_id.title}`
                      : "None"
                  }
                  icon={
                    <GitBranch className="size-4" />
                  }
                />

                {ticket.parent_id ? (

                  <button
                    type="button"
                    onClick={handleParentClick}
                    className="text-left bg-background border border-border rounded-xl p-4 hover:border-primary"
                  >

                    <div className="flex items-center gap-2 text-muted-foreground">

                      <GitBranch className="size-4" />

                      <p className="text-xs">
                        Parent Story
                      </p>

                    </div>

                    <p className="font-semibold text-primary mt-2">
                      {ticket.parent_id.ticket_code}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {ticket.parent_id.title}
                    </p>

                  </button>

                ) : (

                  <InfoItem
                    label="Parent Story"
                    value="None"
                    icon={
                      <GitBranch className="size-4" />
                    }
                  />

                )}

              </div>

            </div>

          </div>

          {/* Comments & Activities */}

          <div className="bg-card border border-border rounded-xl mt-6">

            {/* Tabs */}

            <div className="flex items-center border-b border-border px-6">

              {[
                {
                  key: "all",
                  label: "All"
                },
                {
                  key: "comment",
                  label: "Comment"
                },
                {
                  key: "activities",
                  label: "Activities"
                }
              ].map(tab => (

                <button
                  type="button"
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key)
                  }
                  className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>

              ))}

            </div>

            <div className="p-6">

              {/* Add Comment */}

              {(activeTab === "comment" ||
                activeTab === "all") && (

                <div className="bg-background border border-border rounded-xl p-4 mb-6">

                  <div className="flex items-start gap-3">

                    <MessageSquare className="size-5 text-primary mt-1" />

                    <textarea
                      value={comment}
                      onChange={(event) =>
                        setComment(
                          event.target.value
                        )
                      }
                      placeholder="Write a comment..."
                      rows={3}
                      className="flex-1 bg-transparent resize-none outline-none text-sm"
                    />

                  </div>

                  <div className="flex justify-end mt-3">

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={
                        addingComment ||
                        !comment.trim()
                      }
                    >
                      <Send className="size-4 mr-2" />

                      {addingComment
                        ? "Adding..."
                        : "Add Comment"}
                    </Button>

                  </div>

                </div>

              )}

              {/* Activity List */}

              {displayedActivities.length === 0 ? (

                <div className="py-12 text-center">

                  <MessageSquare className="size-9 mx-auto text-muted-foreground mb-3" />

                  <p className="text-sm text-muted-foreground">
                    {activeTab === "comment"
                      ? "No comments yet"
                      : activeTab === "activities"
                        ? "No activities yet"
                        : "No activity yet"}
                  </p>

                </div>

              ) : (

                <div className="space-y-0">

                  {displayedActivities.map(
                    activity => {

                      const isComment =
                        activity.activity_type ===
                        "COMMENT";

                      return (

                        <div
                          key={activity._id}
                          className="relative flex gap-4 pb-6 last:pb-0"
                        >

                          {/* Timeline */}

                          <div className="flex flex-col items-center">

                            <div className="size-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden">

                              {activity.user_id
                                ?.avatar_url ? (

                                <img
                                  src={
                                    activity.user_id
                                      .avatar_url
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />

                              ) : isComment ? (

                                <MessageSquare className="size-4 text-primary" />

                              ) : (

                                <CircleDot className="size-4 text-primary" />

                              )}

                            </div>

                            <div className="w-px flex-1 bg-border mt-2" />

                          </div>

                          {/* Content */}

                          <div className="flex-1 min-w-0 pb-2">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                              <div>

                                <span className="text-sm font-semibold">
                                  {activity.user_id
                                    ?.full_name ||
                                    "Unknown User"}
                                </span>

                                {!isComment && (

                                  <span className="text-sm text-muted-foreground ml-2">
                                    {getActivityTitle(
                                      activity
                                    )}
                                  </span>

                                )}

                              </div>

                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(
                                  activity.created_at
                                )}
                              </span>

                            </div>

                            {isComment ? (

                              <div className="mt-3 bg-background border border-border rounded-xl p-4">

                                <p className="text-sm whitespace-pre-wrap leading-6">
                                  {activity.content}
                                </p>

                              </div>

                            ) : (

                              <div className="mt-3">

                                {activity.old_value !==
                                  undefined &&
                                  activity.old_value !==
                                    null &&
                                  activity.new_value !==
                                    undefined &&
                                  activity.new_value !==
                                    null && (

                                    <div className="flex items-center gap-3 flex-wrap">

                                      <span className="text-sm bg-muted text-muted-foreground px-3 py-1.5 rounded-md">
                                        {activity.old_value ||
                                          "None"}
                                      </span>

                                      <span className="text-muted-foreground">
                                        →
                                      </span>

                                      <span className="text-sm bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-md">
                                        {activity.new_value ||
                                          "None"}
                                      </span>

                                    </div>

                                  )}

                                {activity.content && (

                                  <p className="text-sm text-muted-foreground mt-2">
                                    {activity.content}
                                  </p>

                                )}

                              </div>

                            )}

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </main>

      </div>

      <Footer />

    </div>
  );
};

export default TicketDetailPage;