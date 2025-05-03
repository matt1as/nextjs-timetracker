import { Project, Activity, TimeEntry } from '@/models/time-tracking';

export class TimeTrackingService {
  private readonly PROJECTS_KEY = 'timetracker_projects';
  private readonly ACTIVITIES_KEY = 'timetracker_activities';
  private readonly TIME_ENTRIES_KEY = 'timetracker_time_entries';

  // Project methods
  saveProject(project: Project): void {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  }

  getProjects(): Project[] {
    const projectsJson = localStorage.getItem(this.PROJECTS_KEY) || '[]';
    const projectsData = JSON.parse(projectsJson);
    
    return projectsData.map((data: any) => {
      const project = new Project({
        id: data.id,
        name: data.name,
        description: data.description
      });
      
      return project;
    });
  }

  getProjectById(id: string): Project | undefined {
    return this.getProjects().find(project => project.id === id);
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(project => project.id !== id);
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    
    // Also delete associated activities
    const activities = this.getActivities().filter(activity => activity.projectId !== id);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    
    // Get the IDs of deleted activities
    const deletedActivityIds = this.getActivities()
      .filter(activity => activity.projectId === id)
      .map(activity => activity.id);
      
    // Delete associated time entries
    const timeEntries = this.getTimeEntries().filter(
      entry => !deletedActivityIds.includes(entry.activityId)
    );
    localStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
  }

  // Activity methods
  saveActivity(activity: Activity): void {
    const activities = this.getActivities();
    const existingIndex = activities.findIndex(a => a.id === activity.id);
    
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }
    
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
  }

  getActivities(): Activity[] {
    const activitiesJson = localStorage.getItem(this.ACTIVITIES_KEY) || '[]';
    const activitiesData = JSON.parse(activitiesJson);
    
    return activitiesData.map((data: any) => {
      const activity = new Activity({
        id: data.id,
        name: data.name,
        description: data.description,
        projectId: data.projectId
      });
      
      return activity;
    });
  }

  getActivitiesByProjectId(projectId: string): Activity[] {
    return this.getActivities().filter(activity => activity.projectId === projectId);
  }

  getActivityById(id: string): Activity | undefined {
    return this.getActivities().find(activity => activity.id === id);
  }

  deleteActivity(id: string): void {
    const activities = this.getActivities().filter(activity => activity.id !== id);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    
    // Also delete associated time entries
    const timeEntries = this.getTimeEntries().filter(entry => entry.activityId !== id);
    localStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
  }

  // Time Entry methods
  saveTimeEntry(timeEntry: TimeEntry): void {
    const timeEntries = this.getTimeEntries();
    const existingIndex = timeEntries.findIndex(entry => entry.id === timeEntry.id);
    
    if (existingIndex >= 0) {
      timeEntries[existingIndex] = timeEntry;
    } else {
      timeEntries.push(timeEntry);
    }
    
    localStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
  }

  getTimeEntries(): TimeEntry[] {
    const entriesJson = localStorage.getItem(this.TIME_ENTRIES_KEY) || '[]';
    const entriesData = JSON.parse(entriesJson);
    
    return entriesData.map((data: any) => {
      const timeEntry = new TimeEntry({
        id: data.id,
        hours: data.hours,
        date: new Date(data.date),
        activityId: data.activityId,
        description: data.description
      });
      
      return timeEntry;
    });
  }

  getTimeEntriesByActivityId(activityId: string): TimeEntry[] {
    return this.getTimeEntries().filter(entry => entry.activityId === activityId);
  }

  deleteTimeEntry(id: string): void {
    const timeEntries = this.getTimeEntries().filter(entry => entry.id !== id);
    localStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
  }
}