"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, TimeEntry } from "@/models/time-tracking";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { TimeEntryForm } from "@/components/TimeEntryForm";

export default function ActivityTimePage() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const projectId = searchParams.get("projectId");

  const [activity, setActivity] = useState<Activity | undefined>(undefined);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    const timeTrackingService = new TimeTrackingService();
    const activityData = timeTrackingService.getActivityById(activityId);
    const timeEntryData =
      timeTrackingService.getTimeEntriesByActivityId(activityId);

    setActivity(activityData);
    setTimeEntries(timeEntryData);
    setLoading(false);
  }, [activityId, refreshKey]);

  const handleTimeEntryAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!activityId) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 mb-4">No activity selected</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 mb-4">Activity not found</p>
        {projectId && (
          <Link
            href={`/project?id=${projectId}`}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Return to Project
          </Link>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          {projectId && (
            <Link
              href={`/project?id=${projectId}`}
              className="text-blue-500 hover:text-blue-700 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Project
            </Link>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{activity.name}</h1>
          {activity.description && (
            <p className="text-gray-600 mt-2">{activity.description}</p>
          )}
        </div>

        <TimeEntryForm
          activityId={activityId}
          onTimeEntryAdded={handleTimeEntryAdded}
        />

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Time Entries
          </h2>

          {timeEntries.length === 0 ? (
            <div className="p-4 text-center bg-white shadow rounded-lg">
              <p className="text-gray-500">
                No time entries found for this activity.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium">{entry.hours} hours</p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      {entry.description && (
                        <p className="text-gray-600 mt-2">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
