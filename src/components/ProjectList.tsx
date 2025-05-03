"use client";

import { useEffect, useState } from "react";
import { Project } from "@/models/time-tracking";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import Link from "next/link";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const timeTrackingService = new TimeTrackingService();

  useEffect(() => {
    // Load projects when the component mounts
    const loadedProjects = timeTrackingService.getProjects();
    setProjects(loadedProjects);
  }, []);

  if (projects.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">
          No projects found. Create your first project!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
          <div className="mt-4 flex justify-end">
            <Link
              href={`/project?id=${project.id}`}
              className="text-blue-500 hover:text-blue-700"
            >
              View Activities
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
