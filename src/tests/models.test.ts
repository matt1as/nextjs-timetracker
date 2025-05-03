import { Project, Activity, TimeEntry } from '@/models/time-tracking';

describe('TimeTracking Models', () => {
  describe('Project Model', () => {
    test('should create a project with correct properties', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project',
        description: 'A test project'
      });

      expect(project.id).toBe('1');
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('A test project');
      expect(project.activities).toEqual([]);
    });

    test('should add activities to a project', () => {
      const project = new Project({
        id: '1',
        name: 'Test Project',
      });

      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        projectId: '1'
      });

      project.addActivity(activity);
      expect(project.activities).toContain(activity);
    });
  });

  describe('Activity Model', () => {
    test('should create an activity with correct properties', () => {
      const activity = new Activity({
        id: '1',
        name: 'Test Activity',
        description: 'A test activity',
        projectId: '1'
      });

      expect(activity.id).toBe('1');
      expect(activity.name).toBe('Test Activity');
      expect(activity.description).toBe('A test activity');
      expect(activity.projectId).toBe('1');
      expect(activity.timeEntries).toEqual([]);
    });

    test('should add time entries to an activity', () => {
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

      activity.addTimeEntry(timeEntry);
      expect(activity.timeEntries).toContain(timeEntry);
    });
  });

  describe('TimeEntry Model', () => {
    test('should create a time entry with correct properties', () => {
      const date = new Date('2025-05-03');
      const timeEntry = new TimeEntry({
        id: '1',
        hours: 2,
        date,
        activityId: '1'
      });

      expect(timeEntry.id).toBe('1');
      expect(timeEntry.hours).toBe(2);
      expect(timeEntry.date).toEqual(date);
      expect(timeEntry.activityId).toBe('1');
    });

    test('should not allow negative hours', () => {
      expect(() => {
        new TimeEntry({
          id: '1',
          hours: -1,
          date: new Date(),
          activityId: '1'
        });
      }).toThrow('Hours cannot be negative');
    });
  });
});