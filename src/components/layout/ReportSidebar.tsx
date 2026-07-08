import { NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportSidebarProps {
  mode: 'fill' | 'view';
  teamName: string;
}

const ReportSidebar = ({ mode, teamName }: ReportSidebarProps) => {
  const { teamId } = useParams();
  const { t } = useTranslation();
  const basePath = `/team/${teamId}/${mode}`;

  const navItems = [
    { to: `${basePath}/tasks`, label: t('report.navTasks'), icon: ClipboardList },
    { to: `${basePath}/achievements`, label: t('report.navAchievements'), icon: Trophy },
    { to: `${basePath}/challenges`, label: t('report.navChallenges'), icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-sidebar-foreground">{teamName}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          {mode === 'fill' ? t('report.editReport') : t('report.viewReport')}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn('sidebar-nav-item', isActive && 'sidebar-nav-item-active')}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <NavLink to="/" className="sidebar-nav-item text-sidebar-foreground/60 hover:text-sidebar-foreground">
          {t('report.backHome')}
        </NavLink>
      </div>
    </aside>
  );
};

export default ReportSidebar;
