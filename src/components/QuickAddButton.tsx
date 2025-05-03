"use client";

import { useState, useEffect } from "react";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { Project, Activity, TimeEntry } from "@/models/time-tracking";
import { v4 as uuidv4 } from "uuid";

interface QuickAddButtonProps {
  onTimeEntryAdded: () => void;
}

export function QuickAddButton({ onTimeEntryAdded }: QuickAddButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [hours, setHours] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [errors, setErrors] = useState<{
    project?: string;
    activity?: string;
    hours?: string;
    date?: string;
  }>({});

  const timeTrackingService = new TimeTrackingService();

  // Load projects when the component mounts
  useEffect(() => {
    if (isModalOpen) {
      const loadedProjects = timeTrackingService.getProjects();
      setProjects(loadedProjects);
    }
  }, [isModalOpen]);

  // Load activities when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const projectActivities = timeTrackingService.getActivitiesByProjectId(
        selectedProjectId
      );
      setActivities(projectActivities);
      setSelectedActivityId(""); // Reset activity selection
    } else {
      setActivities([]);
    }
  }, [selectedProjectId]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // Reset form
    setSelectedProjectId("");
    setSelectedActivityId("");
    setHours("");
    setDate("");
    setDescription("");
    setErrors({});
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form
    const newErrors: {
      project?: string;
      activity?: string;
      hours?: string;
      date?: string;
    } = {};

    if (!selectedProjectId) {
      newErrors.project = "Please select a project";
    }

    if (selectedProjectId && !selectedActivityId) {
      newErrors.activity = "Please select an activity";
    }

    if (hours === "") {
      newErrors.hours = "Hours is required";
    } else if (typeof hours === "number" && hours < 0) {
      newErrors.hours = "Hours cannot be negative";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    // If there are errors, display them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create and save new time entry
    try {
      const newTimeEntry = new TimeEntry({
        id: uuidv4(),
        hours: Number(hours),
        date: new Date(date),
        activityId: selectedActivityId,
        description: description.trim() || undefined,
      });

      timeTrackingService.saveTimeEntry(newTimeEntry);

      // Close modal and reset form
      closeModal();

      // Notify parent component
      onTimeEntryAdded();
    } catch (error) {
      // Handle errors from TimeEntry constructor
      if (error instanceof Error) {
        if (error.message.includes("negative")) {
          setErrors({ ...newErrors, hours: "Hours cannot be negative" });
        } else {
          console.error("Error creating time entry:", error);
        }
      }
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
        Quick-Add Time
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Add Time Entry
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project
                </label>
                <select
                  id="project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <p className="mt-1 text-sm text-red-500">{errors.project}</p>
                )}
              </div>

              {selectedProjectId && (
                <div className="mb-4">
                  <label
                    htmlFor="activity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Activity
                  </label>
                  <select
                    id="activity"
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an activity</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                  {errors.activity && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.activity}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="hours"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hours
                </label>
                <input
                  type="number"
                  id="hours"
                  value={hours}
                  onChange={(e) =>
                    setHours(e.target.value ? Number(e.target.value) : "")
                  }
                  min="0"
                  step="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.hours && (
                  <p className="mt-1 text-sm text-red-500">{errors.hours}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="quick-add-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="quick-add-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}