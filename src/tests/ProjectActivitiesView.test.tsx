import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProjectActivitiesView } from "@/components/ProjectActivitiesView";
import { TimeTrackingService } from "@/utils/time-tracking-service";
import { Project, Activity } from "@/models/time-tracking";

// Mock the TimeTrackingService
jest.mock("@/utils/time-tracking-service");

// Mock the ActivityForm component
jest.mock("@/components/ActivityForm", () => ({
  ActivityForm: ({
    projectId,
    onActivityAdded,
  }: {
    projectId: string;
    onActivityAdded: () => void;
  }) => (
    <div data-testid="mock-activity-form">
      Mock Activity Form for project {projectId}
      <button onClick={onActivityAdded}>Mock Add Activity</button>
    </div>
  ),
}));

describe("ProjectActivitiesView", () => {
  const mockProject = new Project({
    id: "project1",
    name: "Test Project",
    description: "Test Description",
  });

  const mockActivities = [
    new Activity({
      id: "activity1",
      name: "Test Activity 1",
      projectId: "project1",
    }),
    new Activity({
      id: "activity2",
      name: "Test Activity 2",
      description: "Activity Description",
      projectId: "project1",
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock implementation of TimeTrackingService
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjectById: jest.fn().mockReturnValue(mockProject),
          getActivitiesByProjectId: jest.fn().mockReturnValue(mockActivities),
          getProjects: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          saveActivity: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );
  });

  test("renders the project name and description", () => {
    render(<ProjectActivitiesView projectId="project1" />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("renders a list of activities for the project", () => {
    render(<ProjectActivitiesView projectId="project1" />);

    expect(screen.getByText("Test Activity 1")).toBeInTheDocument();
    expect(screen.getByText("Test Activity 2")).toBeInTheDocument();
    expect(screen.getByText("Activity Description")).toBeInTheDocument();
  });

  test("displays a message when no activities are found", () => {
    // Override the mock to return an empty array
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjectById: jest.fn().mockReturnValue(mockProject),
          getActivitiesByProjectId: jest.fn().mockReturnValue([]),
          getProjects: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          saveActivity: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );

    render(<ProjectActivitiesView projectId="project1" />);

    expect(
      screen.getByText(
        "No activities found for this project. Add your first activity!"
      )
    ).toBeInTheDocument();
  });

  test("displays a message when project is not found", () => {
    // Override the mock to return undefined for the project
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjectById: jest.fn().mockReturnValue(undefined),
          getActivitiesByProjectId: jest.fn(),
          getProjects: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          saveActivity: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );

    render(<ProjectActivitiesView projectId="nonexistent" />);

    expect(screen.getByText("Project not found")).toBeInTheDocument();
  });

  test("renders the activity form", () => {
    render(<ProjectActivitiesView projectId="project1" />);

    expect(screen.getByTestId("mock-activity-form")).toBeInTheDocument();
    expect(
      screen.getByText(/Mock Activity Form for project project1/)
    ).toBeInTheDocument();
  });

  test("refreshes activities when a new activity is added", () => {
    const mockGetActivitiesByProjectId = jest
      .fn()
      .mockReturnValue(mockActivities);
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjectById: jest.fn().mockReturnValue(mockProject),
          getActivitiesByProjectId: mockGetActivitiesByProjectId,
          getProjects: jest.fn(),
          saveProject: jest.fn(),
          deleteProject: jest.fn(),
          getActivities: jest.fn(),
          saveActivity: jest.fn(),
          getActivityById: jest.fn(),
          deleteActivity: jest.fn(),
          getTimeEntries: jest.fn(),
          getTimeEntriesByActivityId: jest.fn(),
          saveTimeEntry: jest.fn(),
          deleteTimeEntry: jest.fn(),
        } as unknown as TimeTrackingService)
    );

    render(<ProjectActivitiesView projectId="project1" />);

    // Initial call to load activities
    expect(mockGetActivitiesByProjectId).toHaveBeenCalledTimes(1);

    // Simulate adding a new activity
    fireEvent.click(screen.getByText("Mock Add Activity"));

    // Should call getActivitiesByProjectId again to refresh the list
    expect(mockGetActivitiesByProjectId).toHaveBeenCalledTimes(2);
  });
});
