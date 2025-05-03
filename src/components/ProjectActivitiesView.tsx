"use client";

import React, { useEffect, useState } from "react";
import { Project } from "@/models/time-tracking";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { ActivityList } from "./ActivityList";
import { ActivityForm } from "./ActivityForm";

interface ProjectActivitiesViewProps {
  projectId: string;
}

export function ProjectActivitiesView({
  projectId,
}: ProjectActivitiesViewProps) {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load project data when component mounts or projectId changes
    const timeTrackingService = new TimeTrackingService();
    const loadedProject = timeTrackingService.getProjectById(projectId);
    setProject(loadedProject);
    setLoading(false);
  }, [projectId]);

  // Function to handle when a new activity is added
  const handleActivityAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
      </div>

      <ActivityForm
        projectId={projectId}
        onActivityAdded={handleActivityAdded}
      />

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Activities</h2>
      <div key={refreshKey}>
        <ActivityList projectId={projectId} />
      </div>
    </div>
  );
}
