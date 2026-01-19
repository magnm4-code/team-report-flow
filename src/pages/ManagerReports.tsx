import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getTeams, getTasks, getAchievements, getChallenges } from '@/lib/storage';
import { Team, Task, Achievement, Challenge } from '@/types';
import { 
  ArrowRight, 
  CheckCircle2, 
  ListTodo, 
  AlertTriangle, 
  Trophy,
  Clock,
  Eye,
  Home
} from 'lucide-react';

const ManagerReports = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [teamData, setTeamData] = useState<{
    [key: string]: {
      tasks: Task[];
      achievements: Achievement[];
      challenges: Challenge[];
    };
  }>({});

  useEffect(() => {
    const loadedTeams = getTeams();
    setTeams(loadedTeams);
    
    // Load data for all teams
    const data: typeof teamData = {};
    loadedTeams.forEach(team => {
      data[team.id] = {
        tasks: getTasks(team.id),
        achievements: getAchievements(team.id),
        challenges: getChallenges(team.id),
      };
    });
    setTeamData(data);
  }, []);

  const filteredTeams = selectedTeamId === 'all' 
    ? teams 
    : teams.filter(t => t.id === selectedTeamId);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تطوير': return 'bg-sky/20 text-sky border-sky/30';
      case 'دراسة': return 'bg-highlight/20 text-highlight border-highlight/30';
      case 'مراجعة': return 'bg-accent/20 text-accent border-accent/30';
      case 'معلقة': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'دراسة و تطوير': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">تقارير الفرق</h1>
            </div>
            <Link to="/">
              <Button variant="secondary" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Filter Section */}
        <Card className="mb-8 card-elevated">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-foreground">تصفية حسب الفريق:</label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="اختر الفريق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفرق</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                ({filteredTeams.length} فريق)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Teams Reports */}
        {filteredTeams.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg">لا توجد فرق مسجلة</p>
              <Link to="/admin" className="mt-4 inline-block">
                <Button variant="outline">إضافة فريق جديد</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredTeams.map(team => {
              const data = teamData[team.id] || { tasks: [], achievements: [], challenges: [] };
              const activeTasks = data.tasks.length;
              const achievementsCount = data.achievements.length;
              const challengesCount = data.challenges.length;

              return (
                <Card key={team.id} className="card-elevated animate-fade-in overflow-hidden">
                  {/* Team Header */}
                  <CardHeader className="bg-primary/5 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-primary">{team.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>آخر تحديث: {formatDate(team.updatedAt)}</span>
                        </div>
                      </div>
                      <Link to={`/team/${team.id}/view/tasks`}>
                        <Button className="gap-2 bg-secondary hover:bg-secondary/90">
                          <Eye className="w-4 h-4" />
                          عرض التقرير الكامل
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-sky/10 rounded-lg p-4 text-center border border-sky/20">
                        <ListTodo className="w-8 h-8 mx-auto mb-2 text-sky" />
                        <p className="text-2xl font-bold text-sky">{activeTasks}</p>
                        <p className="text-sm text-muted-foreground">مهام نشطة</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4 text-center border border-accent/20">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                        <p className="text-2xl font-bold text-accent">{achievementsCount}</p>
                        <p className="text-sm text-muted-foreground">إنجازات</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4 text-center border border-destructive/20">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                        <p className="text-2xl font-bold text-destructive">{challengesCount}</p>
                        <p className="text-sm text-muted-foreground">تحديات</p>
                      </div>
                    </div>

                    {/* Tasks Preview */}
                    {data.tasks.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <ListTodo className="w-5 h-5 text-secondary" />
                          المهام الحالية
                        </h3>
                        <div className="space-y-2">
                          {data.tasks.slice(0, 3).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                              <span className="font-medium">{task.taskText}</span>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {task.completionRate}%
                                </span>
                              </div>
                            </div>
                          ))}
                          {data.tasks.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              + {data.tasks.length - 3} مهام أخرى
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Achievements Preview */}
                    {data.achievements.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-accent" />
                          آخر الإنجازات
                        </h3>
                        <div className="space-y-2">
                          {data.achievements.slice(0, 2).map(achievement => (
                            <div key={achievement.id} className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
                              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                              <span className="line-clamp-1">{achievement.text}</span>
                            </div>
                          ))}
                          {data.achievements.length > 2 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              + {data.achievements.length - 2} إنجازات أخرى
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Challenges Preview */}
                    {data.challenges.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          التحديات
                        </h3>
                        <div className="space-y-2">
                          {data.challenges.slice(0, 2).map(challenge => (
                            <div key={challenge.id} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                              <p className="line-clamp-2">{challenge.text}</p>
                            </div>
                          ))}
                          {data.challenges.length > 2 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              + {data.challenges.length - 2} تحديات أخرى
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {data.tasks.length === 0 && data.achievements.length === 0 && data.challenges.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>لم يتم إضافة أي بيانات لهذا الفريق بعد</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerReports;
