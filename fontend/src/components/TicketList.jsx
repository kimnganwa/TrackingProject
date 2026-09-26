import React, { useEffect, useState } from 'react'
import TicketCard from './TicketCard';
import TicktetEmptyState from './TicktetEmptyState';
import api from "@/lib/axios";
import { toast } from 'sonner';

const TicketList = ({ filterTicket, filter, handleTicketChange, activeSprint }) => { 
  const [users, setUsers] = useState([]);
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const columns = ["Backlog", "To Do", "In Progress", "Testing", "Done"];

  const sortedTickets = [...(filterTicket || [])].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const getColumnTickets = (column) => {
    if (column === "Backlog") {
      return sortedTickets.filter(ticket => !ticket.sprint_id);
    }

    return sortedTickets.filter(
      ticket =>
        ticket.sprint_id === activeSprint?._id &&
        ticket.status === column
    );
  };

  const handleDragStart = (event, ticket) => {
    setDraggedTicket(ticket);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ticket._id);
  };

  const handleDragOver = (event, status) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    setDragOverColumn(status);
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    setDragOverColumn(null);

    if (!draggedTicket) {
      return;
    }

    try {
      // Backlog -> To Do
      if (!draggedTicket.sprint_id) {
        if (newStatus === "Backlog") {
          return;
        }

        if (newStatus !== "To Do") {
          toast.error("Backlog tickets must move to To Do");
          return;
        }

        if (!activeSprint) {
          toast.error("This project has no active sprint");
          return;
        }

        await api.put(`/tickets/${draggedTicket._id}`, {
          sprint_id: activeSprint._id,
          status: "To Do"
        });
      }

      // To Do -> Backlog
      else if (newStatus === "Backlog") {
        if (draggedTicket.status !== "To Do") {
          toast.error("Only To Do tickets can move to Backlog");
          return;
        }

        await api.put(`/tickets/${draggedTicket._id}`, {
          sprint_id: null
        });
      }

      // Ticket trong Active Sprint đổi status
      else {
        if (draggedTicket.status === newStatus) {
          return;
        }

        await api.put(`/tickets/${draggedTicket._id}`, {
          status: newStatus
        });
      }

      toast.success(
        `${draggedTicket.ticket_code} moved to ${newStatus}`
      );

      handleTicketChange();

    } catch (error) {
      console.error("Failed to update ticket:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update ticket"
      );
    } finally {
      setDraggedTicket(null);
    }
  };

  if (!sortedTickets || sortedTickets.length === 0) {
    return <TicktetEmptyState filter={filter} />
  }

  return (
    <div className="grid grid-cols-5 gap-4 pb-4 items-stretch w-full">
      {columns.map((statusTitle) => {
        const statusTickets = getColumnTickets(statusTitle);

        return (
          <div
            key={statusTitle}
            onDragOver={(event) => handleDragOver(event, statusTitle)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, statusTitle)}
           className={`w-full rounded-xl p-4 flex flex-col h-[850px] transition-all duration-200 ${
              dragOverColumn === statusTitle
                ? "bg-primary/20 ring-2 ring-primary"
                : "bg-secondary"
            }`}
          >
            
            {/* Header cột */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="font-semibold text-sm">
                {statusTitle}
              </h3>

              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {statusTickets.length}
              </span>
            </div>

            {/* List card trong cột */}
            <div
              className={`space-y-3 flex flex-col flex-1 min-h-0 pr-2 pb-2
                scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent
                ${statusTickets.length > 4 ? "overflow-y-auto" : "overflow-y-hidden"}`}
            >
              {statusTickets.map((ticket, index) => (
                <TicketCard
                  key={ticket._id ?? index}
                  ticket={ticket}
                  index={index}
                  users={users}
                  handleDragStart={handleDragStart}
                />
              ))}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default TicketList;