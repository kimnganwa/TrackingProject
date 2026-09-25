import React from 'react';
import {
  TriangleAlert,
  CircleCheckBig
} from 'lucide-react';

const BottleneckPanel = ({ bottlenecks, sle }) => {

  const formatDuration = (milliseconds) => {
    if (milliseconds === null || milliseconds === undefined) {
      return "N/A";
    }

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
          Bottleneck Detection
        </h2>

        <p className="text-sm text-muted-foreground">
          SLE: {formatDuration(sle)}
        </p>
      </div>

      {bottlenecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CircleCheckBig className="size-10 text-green-600 mb-3" />

          <p className="font-medium">
            No bottleneck detected
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            Workflow is currently within the configured limits.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {bottlenecks.map(bottleneck => (
            <div
              key={bottleneck.status}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <TriangleAlert className="size-5 text-primary" />

                <h3 className="font-semibold">
                  {bottleneck.status}
                </h3>
              </div>

              <p className="text-sm">
                WIP:{" "}
                <span className="font-semibold">
                  {bottleneck.current_wip} / {bottleneck.wip_limit}
                </span>
              </p>

              <div className="space-y-2 mt-4">
                {bottleneck.aging_tickets.map(ticket => (
                  <div
                    key={ticket.ticket_id}
                    className="bg-muted/50 rounded-lg p-3 flex justify-between gap-3"
                  >
                    <span className="text-sm font-medium">
                      {ticket.ticket_code}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      {formatDuration(ticket.task_aging)}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default BottleneckPanel;