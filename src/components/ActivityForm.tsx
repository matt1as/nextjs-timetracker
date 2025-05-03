"use client";

import { useState } from "react";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { Activity } from "@/models/time-tracking";
import { v4 as uuidv4 } from "uuid";

interface ActivityFormProps {
  projectId: string;
  onActivityAdded: () => void;
}

export function ActivityForm({
  projectId,
  onActivityAdded,
}: ActivityFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const timeTrackingService = new TimeTrackingService();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      setError("Activity name is required");
      return;
    }

    // Clear previous errors
    setError("");

    // Create and save new activity
    const newActivity = new Activity({
      id: uuidv4(),
      name: name.trim(),
      description: description.trim() || undefined,
      projectId: projectId,
    });

    timeTrackingService.saveActivity(newActivity);

    // Reset form
    setName("");
    setDescription("");

    // Notify parent component
    onActivityAdded();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Activity
      </h2>

      <form onSubmit={handleSubmit} data-testid="activity-form">
        <div className="mb-4">
          <label
            htmlFor="activity-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Activity Name
          </label>
          <input
            type="text"
            id="activity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="activity-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="activity-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Activity
          </button>
        </div>
      </form>
    </div>
  );
}
