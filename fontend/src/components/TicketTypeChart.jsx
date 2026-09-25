import React from 'react';
import {
  PieChart,
  Pie,
  Sector,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const TicketTypeChart = ({ tickets }) => {
  const data = ["Story", "Task", "Bug"].map(type => ({
    name: type,
    value: tickets.filter(ticket => ticket.type === type).length
  }));

  const COLORS = [
    "var(--story)",
    "var(--task)",
    "var(--bug)"
  ];

  const renderShape = (props) => (
    <Sector
      {...props}
      fill={COLORS[props.index]}
    />
  );

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Ticket by Type
        </h2>

        <p className="text-sm text-muted-foreground">
          Ticket distribution in the active sprint
        </p>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No tickets
        </p>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
                shape={renderShape}
              />

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TicketTypeChart;