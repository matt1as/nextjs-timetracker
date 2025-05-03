import { render, screen } from "@testing-library/react";
import { ProjectList } from "@/components/ProjectList";
import { Project } from "@/models/time-tracking";
import { TimeTrackingService } from "@/utils/time-tracking-service";

// Mock the TimeTrackingService
jest.mock("@/utils/time-tracking-service");

describe("ProjectList Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Default mock implementation
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjects: jest
            .fn()
            .mockReturnValue([
              new Project({
                id: "1",
                name: "Test Project 1",
                description: "Project 1 description",
              }),
              new Project({ id: "2", name: "Test Project 2" }),
            ]),
        } as unknown as TimeTrackingService)
    );
  });

  test("renders projects from the service", () => {
    render(<ProjectList />);

    // Check that project names are displayed
    expect(screen.getByText("Test Project 1")).toBeInTheDocument();
    expect(screen.getByText("Test Project 2")).toBeInTheDocument();

    // Check that project descriptions are displayed
    expect(screen.getByText("Project 1 description")).toBeInTheDocument();
  });

  test("displays message when no projects exist", () => {
    // Override the mock for this test only
    (
      TimeTrackingService as jest.MockedClass<typeof TimeTrackingService>
    ).mockImplementation(
      () =>
        ({
          getProjects: jest.fn().mockReturnValue([]),
        } as unknown as TimeTrackingService)
    );

    render(<ProjectList />);

    expect(
      screen.getByText("No projects found. Create your first project!")
    ).toBeInTheDocument();
  });
});
