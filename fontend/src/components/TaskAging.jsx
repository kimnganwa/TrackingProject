import React from 'react';
import { Clock3 } from 'lucide-react';

const TaskAging = ({ tickets }) => {

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white">

      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Task Aging
        </h2>

        <p className="text-sm text-muted-foreground">
          Time active tickets have spent in progress
        </p>
      </div>

      <div className="space-y-3">
        {tickets.map(ticket => (
          <div
            key={ticket._id}
            className="border rounded-lg p-4"
          >
            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-xs font-semibold text-primary">
                  {ticket.ticket_code}
                </p>

                <p className="text-sm font-medium mt-1">
                  {ticket.title}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {ticket.status}
                </p>
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <Clock3 className="size-4 text-primary" />

                <span className="text-sm font-semibold">
                  {formatDuration(ticket.task_aging)}
                </span>
              </div>

            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No aging tickets
          </p>
        )}
      </div>

    </div>
  );
};

export default TaskAging;