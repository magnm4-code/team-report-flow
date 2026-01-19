import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTasks } from '@/lib/storage';
import { Task, TaskStatus } from '@/types';
import { ClipboardList } from 'lucide-react';

const TasksView = () => {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (teamId) {
      setTasks(getTasks(teamId));
    }
  }, [teamId]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'تطوير':
        return 'bg-secondary/20 text-secondary';
      case 'دراسة':
        return 'bg-accent/20 text-foreground';
      case 'مراجعة':
        return 'bg-highlight/20 text-highlight';
      case 'معلقة':
        return 'bg-destructive/20 text-destructive';
      case 'دراسة و تطوير':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          المهام
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد مهام مسجلة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>المهمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>نسبة الإنجاز</TableHead>
                  <TableHead>نسبة التقدم الأسبوعي</TableHead>
                  <TableHead>تاريخ آخر تحديث</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="animate-fade-in">
                    <TableCell className="font-medium max-w-xs">
                      {task.taskText}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${task.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{task.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success transition-all"
                            style={{ width: `${task.weeklyProgressRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{task.weeklyProgressRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.lastUpdateDate}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {task.latestUpdate || '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksView;
