// Define interfaces for our model parameters
interface ProjectParams {
  id: string;
  name: string;
  description?: string;
}

interface ActivityParams {
  id: string;
  name: string;
  description?: string;
  projectId: string;
}

interface TimeEntryParams {
  id: string;
  hours: number;
  date: Date;
  activityId: string;
  description?: string;
}

// Project class
export class Project {
  id: string;
  name: string;
  description?: string;
  activities: Activity[] = [];

  constructor(params: ProjectParams) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
  }

  addActivity(activity: Activity): void {
    this.activities.push(activity);
  }
}

// Activity class
export class Activity {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  timeEntries: TimeEntry[] = [];

  constructor(params: ActivityParams) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.projectId = params.projectId;
  }

  addTimeEntry(timeEntry: TimeEntry): void {
    this.timeEntries.push(timeEntry);
  }
}

// TimeEntry class
export class TimeEntry {
  id: string;
  hours: number;
  date: Date;
  activityId: string;
  description?: string;

  constructor(params: TimeEntryParams) {
    if (params.hours < 0) {
      throw new Error('Hours cannot be negative');
    }
    
    this.id = params.id;
    this.hours = params.hours;
    this.date = params.date;
    this.activityId = params.activityId;
    this.description = params.description;
  }
}