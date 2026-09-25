import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AssigneeChart = ({ tickets }) => {
  const assigneeMap = {};

  tickets.forEach(ticket => {
    const name =
      ticket.assignee_id?.full_name || "Unassigned";

    if (!assigneeMap[name]) {
      assigneeMap[name] = 0;
    }

    assigneeMap[name]++;
  });

  const data = Object.entries(assigneeMap).map(
    ([name, tickets]) => ({
      name,
      tickets
    })
  );

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Ticket by Assignee
        </h2>

        <p className="text-sm text-muted-foreground">
          Workload distribution in the active sprint
        </p>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No tickets
        </p>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip />

              <Bar
                dataKey="tickets"
                fill="#C13383"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AssigneeChart;