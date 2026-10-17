export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  avatarEmoji: string;
  role: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  timeSpentMinutes: number;
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  deadline: string; // YYYY-MM-DD
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  projectId: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  note?: string;
  mode: 'pomodoro' | 'stopwatch' | 'manual';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  type: 'deadline' | 'meeting' | 'milestone' | 'sprint';
  projectId?: string;
  color?: string;
  notes?: string;
}

export interface UserDataStore {
  projects: Project[];
  tasks: Task[];
  timeLogs: TimeLog[];
  events: CalendarEvent[];
  scratchpad: string;
  lastSyncedAt: string;
}

export type ViewTab = 'dashboard' | 'projects' | 'planner' | 'calendar' | 'working' | 'settings';
export type ThemeMode = 'light' | 'dark';
