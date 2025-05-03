"use client";

import { useState } from "react";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { TimeEntry } from "@/models/time-tracking";
import { v4 as uuidv4 } from "uuid";

interface TimeEntryFormProps {
  activityId: string;
  onTimeEntryAdded: () => void;
}

export function TimeEntryForm({
  activityId,
  onTimeEntryAdded,
}: TimeEntryFormProps) {
  const [hours, setHours] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ hours?: string; date?: string }>({});
  const timeTrackingService = new TimeTrackingService();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form
    const newErrors: { hours?: string; date?: string } = {};

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
        activityId: activityId,
        description: description.trim() || undefined,
      });

      timeTrackingService.saveTimeEntry(newTimeEntry);

      // Reset form
      setHours("");
      setDate("");
      setDescription("");

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
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add Time Entry
      </h2>

      <form onSubmit={handleSubmit} data-testid="time-entry-form">
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
            htmlFor="time-entry-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="time-entry-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Time Entry
          </button>
        </div>
      </form>
    </div>
  );
}
