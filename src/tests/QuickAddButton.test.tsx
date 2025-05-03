import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickAddButton } from '@/components/QuickAddButton';
import { TimeTrackingService } from '@/utils/time-tracking-service';
import '@testing-library/jest-dom';

// Mock the time tracking service
jest.mock('@/utils/time-tracking-service');

describe('QuickAddButton', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock implementation for TimeTrackingService
    const mockProjects = [
      { id: 'project1', name: 'Project 1' },
      { id: 'project2', name: 'Project 2' }
    ];
    
    const mockActivities = [
      { id: 'activity1', name: 'Activity 1', projectId: 'project1' },
      { id: 'activity2', name: 'Activity 2', projectId: 'project1' },
      { id: 'activity3', name: 'Activity 3', projectId: 'project2' }
    ];
    
    // Setup mock implementations
    TimeTrackingService.prototype.getProjects = jest.fn().mockReturnValue(mockProjects);
    TimeTrackingService.prototype.getActivitiesByProjectId = jest.fn().mockImplementation(
      (projectId) => mockActivities.filter(a => a.projectId === projectId)
    );
    TimeTrackingService.prototype.saveTimeEntry = jest.fn();
  });

  it('renders a Quick-Add button', () => {
    render(<QuickAddButton onTimeEntryAdded={() => {}} />);
    expect(screen.getByText('Quick-Add Time')).toBeInTheDocument();
  });

  it('opens the modal when button is clicked', () => {
    render(<QuickAddButton onTimeEntryAdded={() => {}} />);
    fireEvent.click(screen.getByText('Quick-Add Time'));
    expect(screen.getByText('Add Time Entry')).toBeInTheDocument();
  });

  it('shows project and activity dropdowns in the modal', () => {
    render(<QuickAddButton onTimeEntryAdded={() => {}} />);
    fireEvent.click(screen.getByText('Quick-Add Time'));
    
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
    expect(screen.getByText('Select a project')).toBeInTheDocument();
  });
  
  it('loads activities when a project is selected', () => {
    render(<QuickAddButton onTimeEntryAdded={() => {}} />);
    fireEvent.click(screen.getByText('Quick-Add Time'));
    
    // Select a project
    const projectSelect = screen.getByLabelText('Project');
    fireEvent.change(projectSelect, { target: { value: 'project1' } });
    
    // Check that activities are loaded
    expect(TimeTrackingService.prototype.getActivitiesByProjectId).toHaveBeenCalledWith('project1');
    expect(screen.getByLabelText('Activity')).toBeInTheDocument();
  });
  
  it('saves a time entry when the form is submitted with valid data', () => {
    // Mock the current date for consistent testing
    const mockDate = new Date('2025-05-03');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    const mockOnTimeEntryAdded = jest.fn();
    render(<QuickAddButton onTimeEntryAdded={mockOnTimeEntryAdded} />);
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick-Add Time'));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Project'), { target: { value: 'project1' } });
    fireEvent.change(screen.getByLabelText('Activity'), { target: { value: 'activity1' } });
    fireEvent.change(screen.getByLabelText('Hours'), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-05-03' } });
    fireEvent.change(screen.getByLabelText('Description (optional)'), { target: { value: 'Test entry' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Entry'));
    
    // Check that timeTrackingService.saveTimeEntry was called
    expect(TimeTrackingService.prototype.saveTimeEntry).toHaveBeenCalled();
    expect(mockOnTimeEntryAdded).toHaveBeenCalled();
    
    // The modal should be closed
    expect(screen.queryByText('Add Time Entry')).not.toBeInTheDocument();
    
    // Restore the original Date implementation
    global.Date.mockRestore();
  });
  
  it('displays validation errors for invalid data', () => {
    render(<QuickAddButton onTimeEntryAdded={() => {}} />);
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick-Add Time'));
    
    // Clear date field and submit with incomplete form
    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '' } });
    
    // Submit without filling required fields
    fireEvent.click(screen.getByText('Add Entry'));
    
    // Check for validation errors
    expect(screen.getByText('Please select a project')).toBeInTheDocument();
    expect(screen.getByText('Hours is required')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });
});