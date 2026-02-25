import { supabase } from '@/integrations/supabase/client';
import { ThemeColors, Settings } from '@/types';

const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '204 66% 21%',
  secondary: '180 72% 39%',
  accent: '199 71% 65%',
  success: '74 54% 51%',
  highlight: '250 32% 51%',
};

const DEFAULT_SETTINGS: Settings = {
  headerTitle: 'التقرير الأسبوعي',
  headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق',
  logoUrl: '',
  themeColors: DEFAULT_THEME_COLORS,
  featuresTitle: 'مميزات النظام',
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  const { data } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (data) {
    const themeColors = (data.theme_colors as Record<string, string>) || {};
    return {
      headerTitle: data.header_title,
      headerSubtitle: data.header_subtitle,
      logoUrl: data.logo_url || '',
      featuresTitle: data.features_title || 'مميزات النظام',
      themeColors: { ...DEFAULT_THEME_COLORS, ...themeColors },
    };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  const payload = {
    header_title: settings.headerTitle,
    header_subtitle: settings.headerSubtitle,
    logo_url: settings.logoUrl || '',
    features_title: settings.featuresTitle || 'مميزات النظام',
    theme_colors: JSON.parse(JSON.stringify(settings.themeColors || DEFAULT_THEME_COLORS)),
  };

  if (existing) {
    await supabase.from('app_settings').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('app_settings').insert(payload);
  }

  if (settings.themeColors) {
    applyThemeColors(settings.themeColors);
  }
};

export const applyThemeColors = (colors: ThemeColors): void => {
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--highlight', colors.highlight);
};

export const getDefaultThemeColors = (): ThemeColors => DEFAULT_THEME_COLORS;

// Teams
export const getTeams = async () => {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []).map(t => ({
    id: t.id,
    name: t.name,
    passcode: t.passcode || undefined,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
};

export const getTeam = async (teamId: number) => {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .maybeSingle();
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name,
    passcode: data.passcode || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const createTeam = async (name: string, passcode?: string) => {
  const { data } = await supabase
    .from('teams')
    .insert({ name, passcode: passcode || null })
    .select()
    .single();
  return data ? {
    id: data.id,
    name: data.name,
    passcode: data.passcode || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } : null;
};

export const updateTeam = async (teamId: number, name: string, passcode?: string) => {
  await supabase
    .from('teams')
    .update({ name, passcode: passcode || null })
    .eq('id', teamId);
};

export const deleteTeam = async (teamId: number) => {
  await supabase.from('teams').delete().eq('id', teamId);
};

// Tasks
export const getTasks = async (teamId: number) => {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });
  return (data || []).map(t => ({
    id: t.id,
    teamId: t.team_id,
    taskText: t.task_text,
    status: t.status as any,
    completionRate: t.completion_rate,
    weeklyProgressRate: t.weekly_progress_rate,
    lastUpdateDate: t.last_update_date,
    latestUpdate: t.latest_update,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
};

export const saveTasks = async (teamId: number, tasks: any[]) => {
  await supabase.from('tasks').delete().eq('team_id', teamId);
  if (tasks.length > 0) {
    await supabase.from('tasks').insert(
      tasks.map(t => ({
        team_id: teamId,
        task_text: t.taskText,
        status: t.status,
        completion_rate: t.completionRate,
        weekly_progress_rate: t.weeklyProgressRate,
        last_update_date: t.lastUpdateDate,
        latest_update: t.latestUpdate,
      }))
    );
  }
};

// Achievements
export const getAchievements = async (teamId: number) => {
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });
  return (data || []).map(a => ({
    id: a.id,
    teamId: a.team_id,
    text: a.text,
    date: a.date,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }));
};

export const saveAchievements = async (teamId: number, achievements: any[]) => {
  await supabase.from('achievements').delete().eq('team_id', teamId);
  if (achievements.length > 0) {
    await supabase.from('achievements').insert(
      achievements.map(a => ({
        team_id: teamId,
        text: a.text,
        date: a.date,
      }))
    );
  }
};

// Challenges
export const getChallenges = async (teamId: number) => {
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });
  return (data || []).map(c => ({
    id: c.id,
    teamId: c.team_id,
    text: c.text,
    supportNeeded: c.support_needed || undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
};

export const saveChallenges = async (teamId: number, challenges: any[]) => {
  await supabase.from('challenges').delete().eq('team_id', teamId);
  if (challenges.length > 0) {
    await supabase.from('challenges').insert(
      challenges.map(c => ({
        team_id: teamId,
        text: c.text,
        support_needed: c.supportNeeded || null,
      }))
    );
  }
};

// Team passcode verification
export const verifyTeamPasscode = async (teamId: number, passcode: string): Promise<boolean> => {
  const team = await getTeam(teamId);
  if (!team) return false;
  if (!team.passcode) return true;
  return team.passcode === passcode;
};
