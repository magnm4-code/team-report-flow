import { ReactNode, useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { getTeam } from '@/lib/storage';
import { Team } from '@/types';
import ReportSidebar from './ReportSidebar';
import { Clock } from 'lucide-react';

interface ReportLayoutProps {
  mode: 'fill' | 'view';
}

const ReportLayout = ({ mode }: ReportLayoutProps) => {
  const { teamId } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      const foundTeam = getTeam(teamId);
      setTeam(foundTeam || null);
    }
    setLoading(false);
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!team) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <ReportSidebar mode={mode} teamName={team.name} />
      
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === 'fill' ? 'تحرير التقرير الأسبوعي' : 'التقرير الأسبوعي'}
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>آخر تحديث: {formatDate(team.updatedAt)}</span>
          </div>
        </header>
        
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ReportLayout;
