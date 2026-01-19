import { Team, Task, Achievement, Challenge, Settings } from '@/types';

const ADMIN_PASSWORD = 'admin123';

const DEFAULT_SETTINGS: Settings = {
  headerTitle: 'التقرير الأسبوعي',
  headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق',
};

// Settings
export const getSettings = (): Settings => {
  const data = localStorage.getItem('app_settings');
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem('app_settings', JSON.stringify(settings));
};

// Teams
export const getTeams = (): Team[] => {
  const data = localStorage.getItem('teams');
  return data ? JSON.parse(data) : [];
};

export const saveTeams = (teams: Team[]): void => {
  localStorage.setItem('teams', JSON.stringify(teams));
};

export const getTeam = (teamId: string): Team | undefined => {
  return getTeams().find(t => t.id === teamId);
};

export const createTeam = (name: string, passcode?: string): Team => {
  const teams = getTeams();
  const now = new Date().toISOString();
  const team: Team = {
    id: crypto.randomUUID(),
    name,
    passcode: passcode || undefined,
    createdAt: now,
    updatedAt: now,
  };
  teams.push(team);
  saveTeams(teams);
  return team;
};

export const updateTeam = (teamId: string, name: string, passcode?: string): void => {
  const teams = getTeams();
  const index = teams.findIndex(t => t.id === teamId);
  if (index !== -1) {
    teams[index] = {
      ...teams[index],
      name,
      passcode: passcode || undefined,
      updatedAt: new Date().toISOString(),
    };
    saveTeams(teams);
  }
};

export const deleteTeam = (teamId: string): void => {
  const teams = getTeams().filter(t => t.id !== teamId);
  saveTeams(teams);
  // Also delete team data
  localStorage.removeItem(`tasks_${teamId}`);
  localStorage.removeItem(`achievements_${teamId}`);
  localStorage.removeItem(`challenges_${teamId}`);
};

// Tasks
export const getTasks = (teamId: string): Task[] => {
  const data = localStorage.getItem(`tasks_${teamId}`);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (teamId: string, tasks: Task[]): void => {
  localStorage.setItem(`tasks_${teamId}`, JSON.stringify(tasks));
  updateTeamTimestamp(teamId);
};

// Achievements
export const getAchievements = (teamId: string): Achievement[] => {
  const data = localStorage.getItem(`achievements_${teamId}`);
  return data ? JSON.parse(data) : [];
};

export const saveAchievements = (teamId: string, achievements: Achievement[]): void => {
  localStorage.setItem(`achievements_${teamId}`, JSON.stringify(achievements));
  updateTeamTimestamp(teamId);
};

// Challenges
export const getChallenges = (teamId: string): Challenge[] => {
  const data = localStorage.getItem(`challenges_${teamId}`);
  return data ? JSON.parse(data) : [];
};

export const saveChallenges = (teamId: string, challenges: Challenge[]): void => {
  localStorage.setItem(`challenges_${teamId}`, JSON.stringify(challenges));
  updateTeamTimestamp(teamId);
};

// Update team timestamp
const updateTeamTimestamp = (teamId: string): void => {
  const teams = getTeams();
  const index = teams.findIndex(t => t.id === teamId);
  if (index !== -1) {
    teams[index].updatedAt = new Date().toISOString();
    saveTeams(teams);
  }
};

// Admin authentication
export const verifyAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

export const verifyTeamPasscode = (teamId: string, passcode: string): boolean => {
  const team = getTeam(teamId);
  if (!team) return false;
  if (!team.passcode) return true;
  return team.passcode === passcode;
};
