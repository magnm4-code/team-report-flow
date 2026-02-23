
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (for admin authorization)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: admins can read all, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  passcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams are readable by everyone (for team access via passcode)
CREATE POLICY "Teams are publicly readable" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  task_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'تطوير',
  completion_rate INTEGER NOT NULL DEFAULT 0,
  weekly_progress_rate INTEGER NOT NULL DEFAULT 0,
  last_update_date TEXT NOT NULL DEFAULT '',
  latest_update TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are publicly readable" ON public.tasks
  FOR SELECT USING (true);

CREATE POLICY "Tasks can be managed by anyone" ON public.tasks
  FOR ALL USING (true);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are publicly readable" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Achievements can be managed by anyone" ON public.achievements
  FOR ALL USING (true);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  support_needed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are publicly readable" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Challenges can be managed by anyone" ON public.challenges
  FOR ALL USING (true);

-- App settings table (single row)
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_title TEXT NOT NULL DEFAULT 'التقرير الأسبوعي',
  header_subtitle TEXT NOT NULL DEFAULT 'نظام إدارة التقارير الأسبوعية للفرق',
  logo_url TEXT DEFAULT '',
  features_title TEXT DEFAULT 'مميزات النظام',
  theme_colors JSONB DEFAULT '{"primary":"204 66% 21%","secondary":"180 72% 39%","accent":"199 71% 65%","success":"74 54% 51%","highlight":"250 32% 51%"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings row
INSERT INTO public.app_settings (header_title, header_subtitle, features_title) 
VALUES ('التقرير الأسبوعي', 'نظام إدارة التقارير الأسبوعية للفرق', 'مميزات النظام');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for all tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
