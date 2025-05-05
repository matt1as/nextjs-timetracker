"use client";

import { useState, useEffect, useMemo } from "react";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { Activity, TimeEntry, Project } from "@/models/time-tracking";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types for our filter state
interface FilterState {
  showDailyView: boolean;
  showActivityView: boolean;
  showThisWeekOnly: boolean;
  showDescriptions: boolean;
  sortByHoursDescending: boolean;
  showCharts: boolean;
}

// Define types for our activity details
interface ActivityWithProject extends Omit<Activity, "addTimeEntry"> {
  projectName: string;
  addTimeEntry: (timeEntry: TimeEntry) => void;
}

interface ActivityDetailsState {
  activityMap: Record<string, ActivityWithProject>;
  entries: Record<string, TimeEntry[]>;
}

export default function OverviewPage() {
  // State for our yes/no questions and filtering
  const [filters, setFilters] = useState<FilterState>({
    showDailyView: true,
    showActivityView: true,
    showThisWeekOnly: false,
    showDescriptions: false,
    sortByHoursDescending: true,
    showCharts: false,
  });

  // Derived data from our service
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [sumsByActivity, setSumsByActivity] = useState<Record<string, number>>(
    {}
  );
  const [sumsByDay, setSumsByDay] = useState<Record<string, number>>({});
  const [sortedDays, setSortedDays] = useState<string[]>([]);
  const [dayActivityBreakdown, setDayActivityBreakdown] = useState<
    Record<string, Record<string, number>>
  >({});
  const [activityDetails, setActivityDetails] = useState<ActivityDetailsState>({
    activityMap: {},
    entries: {},
  });

  // Initialize our service - use useMemo to avoid recreation on each render
  const timeTrackingService = useMemo(() => new TimeTrackingService(), []);

  useEffect(() => {
    // Load data from service
    const allTimeEntries = timeTrackingService.getTimeEntries();
    const allActivities = timeTrackingService.getActivities();
    const allProjects = timeTrackingService.getProjects();

    // Create a map of projects for easy lookup
    const projectMap: Record<string, Project> = {};
    allProjects.forEach((project) => {
      projectMap[project.id] = project;
    });

    // Create a map of activities with project info
    const activityMap: Record<string, ActivityWithProject> = {};
    allActivities.forEach((activity) => {
      const project = projectMap[activity.projectId];
      activityMap[activity.id] = {
        ...activity,
        projectName: project ? project.name : "Unknown Project",
        addTimeEntry: (timeEntry: TimeEntry) => {
          activity.addTimeEntry(timeEntry);
        },
      };
    });

    // Filter time entries if "this week only" is selected
    let filteredEntries = allTimeEntries;
    if (filters.showThisWeekOnly) {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      filteredEntries = allTimeEntries.filter(
        (entry) => entry.date >= startOfWeek
      );
    }

    // Calculate sums by activity
    const activitySums: Record<string, number> = {};
    const activityEntries: Record<string, TimeEntry[]> = {};

    filteredEntries.forEach((entry) => {
      const activityId = entry.activityId;

      // Initialize if first entry for this activity
      if (!activitySums[activityId]) {
        activitySums[activityId] = 0;
        activityEntries[activityId] = [];
      }

      // Add hours to sum and entry to list
      activitySums[activityId] += entry.hours;
      activityEntries[activityId].push(entry);
    });

    // Calculate sums by day
    const daySums: Record<string, number> = {};
    // Track hours per activity for each day
    const dayActivityBreakdown: Record<string, Record<string, number>> = {};

    filteredEntries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      const activityId = entry.activityId;

      // Initialize if first entry for this day
      if (!daySums[dateKey]) {
        daySums[dateKey] = 0;
        dayActivityBreakdown[dateKey] = {};
      }

      // Initialize activity tracking for this day if needed
      if (!dayActivityBreakdown[dateKey][activityId]) {
        dayActivityBreakdown[dateKey][activityId] = 0;
      }

      // Add hours to day sum and activity breakdown
      daySums[dateKey] += entry.hours;
      dayActivityBreakdown[dateKey][activityId] += entry.hours;
    });

    // Sort days in descending order
    const days = Object.keys(daySums).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    // Update state with all our calculated data
    setTimeEntries(filteredEntries);
    setSumsByActivity(activitySums);
    setSumsByDay(daySums);
    setSortedDays(days);
    setActivityDetails({
      activityMap,
      entries: activityEntries,
    });
    setDayActivityBreakdown(dayActivityBreakdown);
  }, [filters.showThisWeekOnly, timeTrackingService]); // Include timeTrackingService in dependencies

  // Toggle handler for our yes/no questions
  const toggleFilter = (filterName: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // Get sorted activities based on user preferences
  const getSortedActivities = () => {
    return Object.entries(sumsByActivity).sort(([, hoursA], [, hoursB]) => {
      return filters.sortByHoursDescending
        ? hoursB - hoursA // Sort by highest hours first
        : hoursA - hoursB; // Sort by lowest hours first
    });
  };

  // Prepare chart data for activities
  const getActivityChartData = () => {
    const sortedActivities = getSortedActivities();

    return {
      labels: sortedActivities.map(([activityId]) => {
        const activity = activityDetails.activityMap[activityId];
        return activity
          ? `${activity.name} (${activity.projectName})`
          : "Unknown";
      }),
      datasets: [
        {
          label: "Hours",
          data: sortedActivities.map(([, hours]) => hours),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for days
  const getDayChartData = () => {
    return {
      labels: sortedDays.map((day) => new Date(day).toLocaleDateString()),
      datasets: [
        {
          label: "Hours",
          data: sortedDays.map((day) => sumsByDay[day]),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Time Distribution",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
        },
      },
    },
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Time Tracking Overview</h1>

      {/* Yes/No Filter Questions */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">View Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <label>Show daily summary?</label>
            <button
              onClick={() => toggleFilter("showDailyView")}
              className={`px-3 py-1 rounded-full ${
                filters.showDailyView
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.showDailyView ? "Yes" : "No"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label>Show activity summary?</label>
            <button
              onClick={() => toggleFilter("showActivityView")}
              className={`px-3 py-1 rounded-full ${
                filters.showActivityView
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.showActivityView ? "Yes" : "No"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label>Show only this week?</label>
            <button
              onClick={() => toggleFilter("showThisWeekOnly")}
              className={`px-3 py-1 rounded-full ${
                filters.showThisWeekOnly
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.showThisWeekOnly ? "Yes" : "No"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label>Show descriptions?</label>
            <button
              onClick={() => toggleFilter("showDescriptions")}
              className={`px-3 py-1 rounded-full ${
                filters.showDescriptions
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.showDescriptions ? "Yes" : "No"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label>Sort by highest hours first?</label>
            <button
              onClick={() => toggleFilter("sortByHoursDescending")}
              className={`px-3 py-1 rounded-full ${
                filters.sortByHoursDescending
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.sortByHoursDescending ? "Yes" : "No"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label>Show charts?</label>
            <button
              onClick={() => toggleFilter("showCharts")}
              className={`px-3 py-1 rounded-full ${
                filters.showCharts
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {filters.showCharts ? "Yes" : "No"}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Summary Section */}
      {filters.showDailyView && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Time by Day</h2>

          {/* Daily Chart */}
          {filters.showCharts && sortedDays.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div style={{ height: "400px" }}>
                <Bar data={getDayChartData()} options={chartOptions} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            {sortedDays.length > 0 ? (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Activity Breakdown</th>
                    <th className="text-right py-2">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDays.map((day) => (
                    <tr key={day} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        {new Date(day).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {Object.entries(dayActivityBreakdown[day] || {})
                            .sort(([, hoursA], [, hoursB]) =>
                              filters.sortByHoursDescending
                                ? hoursB - hoursA
                                : hoursA - hoursB
                            )
                            .map(([activityId, hours]) => {
                              const activity =
                                activityDetails.activityMap[activityId];
                              return (
                                <div
                                  key={activityId}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-700">
                                    {activity ? activity.name : "Unknown"}
                                    <span className="text-gray-500 ml-1">
                                      (
                                      {activity
                                        ? activity.projectName
                                        : "Unknown Project"}
                                      )
                                    </span>
                                  </span>
                                  <span className="font-medium">
                                    {hours.toFixed(2)} hrs
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {sumsByDay[day].toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="py-3 font-bold">Total</td>
                    <td></td>
                    <td className="py-3 text-right font-bold">
                      {Object.values(sumsByDay)
                        .reduce((sum, hours) => sum + hours, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No daily data available.</p>
            )}
          </div>
        </div>
      )}

      {/* Activity Summary Section */}
      {filters.showActivityView && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Time by Activity</h2>

          {/* Activity Chart */}
          {filters.showCharts && getSortedActivities().length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div style={{ height: "400px" }}>
                <Bar data={getActivityChartData()} options={chartOptions} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            {getSortedActivities().length > 0 ? (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Project</th>
                    <th className="text-left py-2">Activity</th>
                    <th className="text-right py-2">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedActivities().map(([activityId, hours]) => {
                    const activity = activityDetails.activityMap[activityId];
                    const activityName = activity
                      ? activity.name
                      : "Unknown Activity";
                    const projectName = activity
                      ? activity.projectName
                      : "Unknown Project";

                    return (
                      <tr
                        key={activityId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3">{projectName}</td>
                        <td className="py-3">{activityName}</td>
                        <td className="py-3 text-right font-semibold">
                          {hours.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="py-3 font-bold">
                      Total
                    </td>
                    <td className="py-3 text-right font-bold">
                      {Object.values(sumsByActivity)
                        .reduce((sum, hours) => sum + hours, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No activity data available.</p>
            )}
          </div>

          {/* Descriptions Section (conditionally shown) */}
          {filters.showDescriptions && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Activity Details</h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                {getSortedActivities().map(([activityId, hours]) => {
                  const activity = activityDetails.activityMap[activityId];
                  const entries = activityDetails.entries[activityId] || [];

                  return (
                    <div key={activityId} className="mb-6 last:mb-0">
                      <h4 className="font-medium text-lg mb-2">
                        {activity?.name || "Unknown Activity"} (
                        {hours.toFixed(2)} hours)
                      </h4>
                      <div className="ml-4">
                        {entries.map((entry: TimeEntry) => (
                          <div
                            key={entry.id}
                            className="mb-2 p-2 border-l-2 border-gray-200"
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                              <span className="font-medium">
                                {entry.hours.toFixed(2)} hours
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {entry.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state message */}
      {timeEntries.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
          <p className="text-yellow-700">
            No time entries found. Add some time entries to see the overview.
          </p>
        </div>
      )}
    </main>
  );
}
