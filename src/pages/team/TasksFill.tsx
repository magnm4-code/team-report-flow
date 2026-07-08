import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getTasks, saveTasks, getAchievements, saveAchievements } from '@/lib/storage';
import { Task, TaskStatus } from '@/types';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TASK_STATUSES: TaskStatus[] = ['تطوير', 'دراسة', 'مراجعة', 'معلقة', 'دراسة و تطوير'];

const TasksFill = () => {
  const { teamId: teamIdParam } = useParams();
  const teamId = Number(teamIdParam);
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskText, setTaskText] = useState('');
  const [status, setStatus] = useState<TaskStatus>('تطوير');
  const [completionRate, setCompletionRate] = useState(0);
  const [weeklyProgressRate, setWeeklyProgressRate] = useState(0);
  const [lastUpdateDate, setLastUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [latestUpdate, setLatestUpdate] = useState('');

  useEffect(() => { if (teamId) { getTasks(teamId).then(setTasks); } }, [teamId]);

  const statusLabel = (s: string) => t(`tasks.status.${s}` as any, { defaultValue: s });

  const resetForm = () => { setTaskText(''); setStatus('تطوير'); setCompletionRate(0); setWeeklyProgressRate(0); setLastUpdateDate(new Date().toISOString().split('T')[0]); setLatestUpdate(''); setEditingTask(null); };
  const openAddDialog = () => { resetForm(); setDialogOpen(true); };
  const openEditDialog = (task: Task) => { setEditingTask(task); setTaskText(task.taskText); setStatus(task.status); setCompletionRate(task.completionRate); setWeeklyProgressRate(task.weeklyProgressRate); setLastUpdateDate(task.lastUpdateDate); setLatestUpdate(task.latestUpdate); setDialogOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !taskText.trim()) return;
    const now = new Date().toISOString();
    let updatedTasks: Task[];
    if (editingTask) {
      updatedTasks = tasks.map(x => x.id === editingTask.id ? { ...x, taskText: taskText.trim(), status, completionRate: Math.min(100, Math.max(0, completionRate)), weeklyProgressRate: Math.min(100, Math.max(0, weeklyProgressRate)), lastUpdateDate, latestUpdate: latestUpdate.trim(), updatedAt: now } : x);
      toast({ title: t('tasks.updatedToast') });
    } else {
      const newTask: any = { teamId, taskText: taskText.trim(), status, completionRate: Math.min(100, Math.max(0, completionRate)), weeklyProgressRate: Math.min(100, Math.max(0, weeklyProgressRate)), lastUpdateDate, latestUpdate: latestUpdate.trim(), createdAt: now, updatedAt: now };
      updatedTasks = [...tasks, newTask as Task];
      toast({ title: t('tasks.addedToast') });
    }
    await saveTasks(teamId, updatedTasks);
    const refreshed = await getTasks(teamId);
    setTasks(refreshed);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!teamId || !selectedTask) return;
    const updatedTasks = tasks.filter(x => x.id !== selectedTask.id);
    setTasks(updatedTasks);
    await saveTasks(teamId, updatedTasks);
    setDeleteDialogOpen(false);
    setSelectedTask(null);
    toast({ title: t('tasks.deletedToast') });
  };

  const handleMarkComplete = async (task: Task) => {
    if (!teamId) return;
    const achievements = await getAchievements(teamId);
    const now = new Date().toISOString();
    const newAchievement: any = { teamId, text: `${task.taskText}\n\n${t('tasks.latestUpdateLabel')} ${task.latestUpdate}`, date: now.split('T')[0], createdAt: now, updatedAt: now };
    await saveAchievements(teamId, [...achievements, newAchievement]);
    const updatedTasks = tasks.filter(x => x.id !== task.id);
    setTasks(updatedTasks);
    await saveTasks(teamId, updatedTasks);
    toast({ title: t('tasks.completedToast'), description: t('tasks.completedToastDesc') });
  };

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case 'تطوير': return 'bg-secondary/20 text-secondary';
      case 'دراسة': return 'bg-accent/20 text-foreground';
      case 'مراجعة': return 'bg-highlight/20 text-highlight';
      case 'معلقة': return 'bg-destructive/20 text-destructive';
      case 'دراسة و تطوير': return 'bg-success/20 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('tasks.title')}</CardTitle>
        <Button className="btn-teal" onClick={openAddDialog}><Plus className="w-4 h-4 me-2" />{t('tasks.addTask')}</Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><p>{t('tasks.noTasks')}</p><p className="text-sm mt-2">{t('tasks.noTasksHint')}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>{t('tasks.colTask')}</TableHead>
                  <TableHead>{t('tasks.colStatus')}</TableHead>
                  <TableHead>{t('tasks.colCompletion')}</TableHead>
                  <TableHead>{t('tasks.colWeeklyProgress')}</TableHead>
                  <TableHead>{t('tasks.colLastUpdate')}</TableHead>
                  <TableHead>{t('tasks.colLatestUpdate')}</TableHead>
                  <TableHead>{t('tasks.colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="animate-fade-in">
                    <TableCell className="font-medium max-w-xs">{task.taskText}</TableCell>
                    <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>{statusLabel(task.status)}</span></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-secondary transition-all" style={{ width: `${task.completionRate}%` }} /></div><span className="text-sm">{task.completionRate}%</span></div></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success transition-all" style={{ width: `${task.weeklyProgressRate}%` }} /></div><span className="text-sm">{task.weeklyProgressRate}%</span></div></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.lastUpdateDate}</TableCell>
                    <TableCell className="max-w-xs"><p className="text-sm text-muted-foreground line-clamp-2">{task.latestUpdate || '-'}</p></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success/80" onClick={() => handleMarkComplete(task)} title={t('tasks.markComplete')}><CheckCircle className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(task)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => { setSelectedTask(task); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editingTask ? t('tasks.editTask') : t('tasks.addNewTask')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label>{t('tasks.taskField')}</Label><Input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder={t('tasks.taskPlaceholder')} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('tasks.statusField')}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TASK_STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t('tasks.colLastUpdate')}</Label><Input type="date" value={lastUpdateDate} onChange={(e) => setLastUpdateDate(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('tasks.completionField')}</Label><Input type="number" min={0} max={100} value={completionRate} onChange={(e) => setCompletionRate(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>{t('tasks.weeklyProgressField')}</Label><Input type="number" min={0} max={100} value={weeklyProgressRate} onChange={(e) => setWeeklyProgressRate(Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>{t('tasks.latestUpdateField')}</Label><Textarea value={latestUpdate} onChange={(e) => setLatestUpdate(e.target.value)} placeholder={t('tasks.latestUpdatePlaceholder')} className="min-h-24" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="btn-teal">{editingTask ? t('common.saveChanges') : t('common.add')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('tasks.deleteTask')}</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">{t('tasks.confirmDelete')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TasksFill;
