import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActivityForm } from "@/components/ActivityForm";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { Activity } from "@/models/time-tracking";

// Mock the TimeTrackingService
jest.mock("@/utils/time-tracking-service");

describe("ActivityForm", () => {
  const mockProjectId = "project-123";
  const mockOnActivityAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock implementation of TimeTrackingService
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          saveActivity: jest.fn().mockImplementation((activity: Activity) => {
            // Mock successful saving
          }),
          getProjects: jest.fn(),
          getProjectById: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          getActivitiesByProjectId: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );
  });

  test("renders the activity form", () => {
    render(
      <ActivityForm
        projectId={mockProjectId}
        onActivityAdded={mockOnActivityAdded}
      />
    );

    expect(screen.getByText("Add New Activity")).toBeInTheDocument();
    expect(screen.getByLabelText("Activity Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description (optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Activity" })
    ).toBeInTheDocument();
  });

  test("allows entering activity details", () => {
    render(
      <ActivityForm
        projectId={mockProjectId}
        onActivityAdded={mockOnActivityAdded}
      />
    );

    const nameInput = screen.getByLabelText("Activity Name");
    const descriptionInput = screen.getByLabelText("Description (optional)");

    fireEvent.change(nameInput, { target: { value: "Test Activity" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    expect(nameInput).toHaveValue("Test Activity");
    expect(descriptionInput).toHaveValue("Test Description");
  });

  test("calls onActivityAdded when form is submitted", () => {
    const mockSaveActivity = jest.fn();
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          saveActivity: mockSaveActivity,
          getProjects: jest.fn(),
          getProjectById: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          getActivitiesByProjectId: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );

    render(
      <ActivityForm
        projectId={mockProjectId}
        onActivityAdded={mockOnActivityAdded}
      />
    );

    const nameInput = screen.getByLabelText("Activity Name");
    const form = screen.getByTestId("activity-form");

    fireEvent.change(nameInput, { target: { value: "Test Activity" } });
    fireEvent.submit(form);

    expect(mockSaveActivity).toHaveBeenCalled();
    expect(mockOnActivityAdded).toHaveBeenCalled();
  });

  test("displays error when activity name is empty", () => {
    render(
      <ActivityForm
        projectId={mockProjectId}
        onActivityAdded={mockOnActivityAdded}
      />
    );

    const form = screen.getByTestId("activity-form");
    fireEvent.submit(form);

    expect(screen.getByText("Activity name is required")).toBeInTheDocument();
    expect(mockOnActivityAdded).not.toHaveBeenCalled();
  });

  test("resets form after successful submission", () => {
    render(
      <ActivityForm
        projectId={mockProjectId}
        onActivityAdded={mockOnActivityAdded}
      />
    );

    const nameInput = screen.getByLabelText("Activity Name");
    const descriptionInput = screen.getByLabelText("Description (optional)");
    const form = screen.getByTestId("activity-form");

    fireEvent.change(nameInput, { target: { value: "Test Activity" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });
    fireEvent.submit(form);

    expect(nameInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");
  });
});
