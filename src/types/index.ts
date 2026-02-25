export type TaskStatus = 'تطوير' | 'دراسة' | 'مراجعة' | 'معلقة' | 'دراسة و تطوير';

export interface Task {
  id: number;
  teamId: number;
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
  id: number;
  teamId: number;
  text: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: number;
  teamId: number;
  text: string;
  supportNeeded?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  highlight: string;
}

export interface Settings {
  headerTitle: string;
  headerSubtitle: string;
  logoUrl?: string;
  themeColors?: ThemeColors;
  featuresTitle?: string;
}

export interface Team {
  id: number;
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
