import React from 'react';
import { CalendarDays } from 'lucide-react';

const MyTickets = ({ tickets }) => {

  const activeTickets = [...tickets]
    .filter(ticket => ticket.status !== "Done")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;

      return new Date(a.due_date) - new Date(b.due_date);
    })
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white h-full">

      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          My Tickets
        </h2>

        <p className="text-sm text-muted-foreground">
          Upcoming active tickets
        </p>
      </div>

      <div className="space-y-3">

        {activeTickets.map((ticket) => (
          <div
            key={ticket._id}
            className="border rounded-lg p-4"
          >

            <div className="flex items-center justify-between gap-3">

              <span className="text-xs font-semibold text-primary">
                {ticket.ticket_code}
              </span>

              <span className="text-xs text-muted-foreground">
                {ticket.status}
              </span>

            </div>

            <p className="font-medium text-sm mt-2 line-clamp-2">
              {ticket.title}
            </p>

            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formatDate(ticket.due_date)}
            </div>

          </div>
        ))}

        {activeTickets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No active tickets
          </p>
        )}

      </div>

    </div>
  );
};

export default MyTickets;