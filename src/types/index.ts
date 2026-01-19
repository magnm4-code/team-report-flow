export type TaskStatus = 'تطوير' | 'دراسة' | 'مراجعة' | 'معلقة' | 'دراسة و تطوير';

export interface Task {
  id: string;
  teamId: string;
  taskText: string;
  status: TaskStatus;
  completionRate: number;
  weeklyProgressRate: number;
  lastUpdateDate: string;
  latestUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  teamId: string;
  text: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  teamId: string;
  text: string;
  supportNeeded?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  headerTitle: string;
  headerSubtitle: string;
}

export interface Team {
  id: string;
  name: string;
  passcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportData {
  tasks: Task[];
  achievements: Achievement[];
  challenges: Challenge[];
}
