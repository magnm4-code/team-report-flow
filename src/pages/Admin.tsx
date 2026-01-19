import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/lib/storage';
import { Team } from '@/types';
import { Plus, Edit, Trash2, Eye, FileEdit, Copy, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    setTeams(getTeams());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    createTeam(teamName.trim(), teamPasscode.trim() || undefined);
    loadTeams();
    setTeamName('');
    setTeamPasscode('');
    setCreateDialogOpen(false);
    toast({
      title: 'تم إنشاء الفريق',
      description: `تم إنشاء فريق "${teamName}" بنجاح`,
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !teamName.trim()) return;
    
    updateTeam(selectedTeam.id, teamName.trim(), teamPasscode.trim() || undefined);
    loadTeams();
    setEditDialogOpen(false);
    setSelectedTeam(null);
    toast({
      title: 'تم تحديث الفريق',
      description: 'تم حفظ التغييرات بنجاح',
    });
  };

  const handleDelete = () => {
    if (!selectedTeam) return;
    
    deleteTeam(selectedTeam.id);
    loadTeams();
    setDeleteDialogOpen(false);
    setSelectedTeam(null);
    toast({
      title: 'تم حذف الفريق',
      description: 'تم حذف الفريق وجميع بياناته',
    });
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setTeamPasscode(team.passcode || '');
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const copyTeamId = (teamId: string) => {
    navigator.clipboard.writeText(teamId);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ معرف الفريق',
    });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
              <p className="text-sm opacity-80">إدارة الفرق والتقارير</p>
            </div>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 ml-2" />
              الرئيسية
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{teams.length}</div>
              <div className="text-sm text-muted-foreground">إجمالي الفرق</div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Table */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>الفرق</CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-teal">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة فريق
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إنشاء فريق جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newTeamName">اسم الفريق</Label>
                    <Input
                      id="newTeamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="أدخل اسم الفريق"
                      className="input-rtl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newTeamPasscode">رمز الدخول (اختياري)</Label>
                    <Input
                      id="newTeamPasscode"
                      value={teamPasscode}
                      onChange={(e) => setTeamPasscode(e.target.value)}
                      placeholder="أدخل رمز دخول للفريق"
                      className="input-rtl"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-teal">
                    إنشاء الفريق
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>لا توجد فرق حالياً</p>
                <p className="text-sm mt-2">ابدأ بإنشاء فريق جديد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>اسم الفريق</TableHead>
                    <TableHead>معرف الفريق</TableHead>
                    <TableHead>رمز الدخول</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>آخر تحديث</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id} className="animate-fade-in">
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {team.id.slice(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyTeamId(team.id)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.passcode ? (
                          <span className="badge-purple text-xs px-2 py-1 rounded">
                            محمي
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">بدون رمز</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(team.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(team.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-secondary hover:text-secondary/80"
                            asChild
                          >
                            <Link to={`/team/${team.id}/fill/tasks`}>
                              <FileEdit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-accent hover:text-accent/80"
                            asChild
                          >
                            <Link to={`/team/${team.id}/view/tasks`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(team)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => openDeleteDialog(team)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل الفريق</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTeamName">اسم الفريق</Label>
                <Input
                  id="editTeamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="أدخل اسم الفريق"
                  className="input-rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTeamPasscode">رمز الدخول (اختياري)</Label>
                <Input
                  id="editTeamPasscode"
                  value={teamPasscode}
                  onChange={(e) => setTeamPasscode(e.target.value)}
                  placeholder="أدخل رمز دخول جديد أو اتركه فارغاً"
                  className="input-rtl"
                />
              </div>
              <Button type="submit" className="w-full btn-teal">
                حفظ التغييرات
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>حذف الفريق</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              هل أنت متأكد من حذف فريق "{selectedTeam?.name}"؟ سيتم حذف جميع بيانات التقرير.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
