import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { TimeEntry } from "@/models/time-tracking";

// Mock the TimeTrackingService
jest.mock("@/utils/time-tracking-service");

describe("TimeEntryForm", () => {
  const mockActivityId = "activity-123";
  const mockOnTimeEntryAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          saveTimeEntry: jest
            .fn()
            .mockImplementation((timeEntry: TimeEntry) => {
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
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );
  });

  test("renders the time entry form", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    // Use heading role to specifically target the heading element
    expect(
      screen.getByRole("heading", { name: "Add Time Entry" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Description (optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Time Entry" })
    ).toBeInTheDocument();
  });

  test("allows entering time entry details", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const hoursInput = screen.getByLabelText("Hours");
    const dateInput = screen.getByLabelText("Date");
    const descriptionInput = screen.getByLabelText("Description (optional)");

    fireEvent.change(hoursInput, { target: { value: "5" } });
    fireEvent.change(dateInput, { target: { value: "2025-05-03" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    expect(hoursInput).toHaveValue(5);
    expect(dateInput).toHaveValue("2025-05-03");
    expect(descriptionInput).toHaveValue("Test Description");
  });

  test("calls onTimeEntryAdded when form is submitted with valid data", () => {
    const mockSaveTimeEntry = jest.fn();
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          saveTimeEntry: mockSaveTimeEntry,
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
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );

    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const hoursInput = screen.getByLabelText("Hours");
    const dateInput = screen.getByLabelText("Date");
    const form = screen.getByTestId("time-entry-form");

    fireEvent.change(hoursInput, { target: { value: "5" } });
    fireEvent.change(dateInput, { target: { value: "2025-05-03" } });
    fireEvent.submit(form);

    expect(mockSaveTimeEntry).toHaveBeenCalled();
    expect(mockOnTimeEntryAdded).toHaveBeenCalled();
  });

  test("displays error when hours is not provided", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const dateInput = screen.getByLabelText("Date");
    const form = screen.getByTestId("time-entry-form");

    fireEvent.change(dateInput, { target: { value: "2025-05-03" } });
    fireEvent.submit(form);

    expect(screen.getByText("Hours is required")).toBeInTheDocument();
    expect(mockOnTimeEntryAdded).not.toHaveBeenCalled();
  });

  test("displays error when hours is negative", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const hoursInput = screen.getByLabelText("Hours");
    const dateInput = screen.getByLabelText("Date");
    const form = screen.getByTestId("time-entry-form");

    fireEvent.change(hoursInput, { target: { value: "-1" } });
    fireEvent.change(dateInput, { target: { value: "2025-05-03" } });
    fireEvent.submit(form);

    expect(screen.getByText("Hours cannot be negative")).toBeInTheDocument();
    expect(mockOnTimeEntryAdded).not.toHaveBeenCalled();
  });

  test("displays error when date is not provided", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const hoursInput = screen.getByLabelText("Hours");
    const form = screen.getByTestId("time-entry-form");

    fireEvent.change(hoursInput, { target: { value: "5" } });
    fireEvent.submit(form);

    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(mockOnTimeEntryAdded).not.toHaveBeenCalled();
  });

  test("resets form after successful submission", () => {
    render(
      <TimeEntryForm
        activityId={mockActivityId}
        onTimeEntryAdded={mockOnTimeEntryAdded}
      />
    );

    const hoursInput = screen.getByLabelText("Hours");
    const dateInput = screen.getByLabelText("Date");
    const descriptionInput = screen.getByLabelText("Description (optional)");
    const form = screen.getByTestId("time-entry-form");

    fireEvent.change(hoursInput, { target: { value: "5" } });
    fireEvent.change(dateInput, { target: { value: "2025-05-03" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });
    fireEvent.submit(form);

    expect(hoursInput).toHaveValue(null);
    expect(dateInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");
  });
});
