import React from 'react';
import {
  Timer,
  Clock3,
  Gauge,
  Activity
} from 'lucide-react';

const DashboardStats = ({
  averageCycleTime,
  averageLeadTime,
  throughput,
  sle
}) => {

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

  const stats = [
    {
      title: "Avg Cycle Time",
      value: formatDuration(averageCycleTime),
      icon: Timer
    },
    {
      title: "Avg Lead Time",
      value: formatDuration(averageLeadTime),
      icon: Clock3
    },
    {
      title: "Throughput",
      value: `${throughput} tickets`,
      icon: Gauge
    },
    {
      title: "SLE",
      value: formatDuration(sle),
      icon: Activity
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="border rounded-xl p-5 shadow-sm bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>

                <p className="text-2xl font-bold mt-2 text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="size-6 text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;