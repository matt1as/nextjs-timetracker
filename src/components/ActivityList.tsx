"use client";

import { useEffect, useState } from "react";
import { Activity } from "@/models/time-tracking";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import Link from "next/link";

interface ActivityListProps {
  projectId: string;
}

export function ActivityList({ projectId }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Load activities for this project when the component mounts
    const timeTrackingService = new TimeTrackingService();
    const loadedActivities =
      timeTrackingService.getActivitiesByProjectId(projectId);
    setActivities(loadedActivities);
  }, [projectId]);

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">
          No activities found for this project. Add your first activity!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            {activity.name}
          </h3>
          {activity.description && (
            <p className="text-gray-600 mt-2">{activity.description}</p>
          )}
          <div className="mt-4 flex justify-end">
            <Link
              href={`/activity?id=${activity.id}&projectId=${projectId}`}
              className="text-blue-500 hover:text-blue-700"
            >
              View Time Entries
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
