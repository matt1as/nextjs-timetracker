import { TimeTrackingService } from '@/utils/time-tracking-service';
import { Project, Activity, TimeEntry } from '@/models/time-tracking';

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;

  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
    service = new TimeTrackingService();
  });

  describe('Project Operations', () => {
    test('should save and retrieve projects', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project',
        description: 'A test project'
      });

      service.saveProject(project);
      const retrievedProjects = service.getProjects();
      
      expect(retrievedProjects.length).toBe(1);
      expect(retrievedProjects[0].id).toBe('1');
      expect(retrievedProjects[0].name).toBe('Test Project');
    });

    test('should delete a project', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project'
      });

      service.saveProject(project);
      expect(service.getProjects().length).toBe(1);
      
      service.deleteProject('1');
      expect(service.getProjects().length).toBe(0);
    });
  });

  describe('Activity Operations', () => {
    test('should save and retrieve activities for a project', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project'
      });

      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        projectId: '1'
      });

      service.saveProject(project);
      service.saveActivity(activity);

      const retrievedActivities = service.getActivitiesByProjectId('1');
      
      expect(retrievedActivities.length).toBe(1);
      expect(retrievedActivities[0].id).toBe('1');
      expect(retrievedActivities[0].name).toBe('Test Activity');
    });

    test('should delete an activity', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project'
      });

      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        projectId: '1'
      });

      service.saveProject(project);
      service.saveActivity(activity);
      expect(service.getActivitiesByProjectId('1').length).toBe(1);
      
      service.deleteActivity('1');
      expect(service.getActivitiesByProjectId('1').length).toBe(0);
    });
  });

  describe('TimeEntry Operations', () => {
    test('should save and retrieve time entries for an activity', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project'
      });

      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        projectId: '1'
      });

      const timeEntry = new TimeEntry({
        id: '1',
        hours: 2,
        date: new Date('2025-05-03'),
        activityId: '1'
      });

      service.saveProject(project);
      service.saveActivity(activity);
      service.saveTimeEntry(timeEntry);

      const retrievedEntries = service.getTimeEntriesByActivityId('1');
      
      expect(retrievedEntries.length).toBe(1);
      expect(retrievedEntries[0].id).toBe('1');
      expect(retrievedEntries[0].hours).toBe(2);
    });

    test('should delete a time entry', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project'
      });

      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        projectId: '1'
      });

      const timeEntry = new TimeEntry({
        id: '1',
        hours: 2,
        date: new Date('2025-05-03'),
        activityId: '1'
      });

      service.saveProject(project);
      service.saveActivity(activity);
      service.saveTimeEntry(timeEntry);
      expect(service.getTimeEntriesByActivityId('1').length).toBe(1);
      
      service.deleteTimeEntry('1');
      expect(service.getTimeEntriesByActivityId('1').length).toBe(0);
    });
  });
});