export interface Space {
  id: string;
  name: string;
  color: string; // e.g. 'bg-red-500'
  icon?: string; // e.g. 'work'
}

export interface TimeEntry {
  id: string;
  spaceId: string;
  date: string; // YYYY-MM-DD
  duration: number; // in hours
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  description: string;
  tags?: string[];
  icon?: string; // e.g. 'code'
  source?: string; // e.g. 'pomodoro'
  app?: string; // Alternative identifier
}

export type View = 'loading' | 'welcome' | 'spaces' | 'calendar' | 'statistics';
