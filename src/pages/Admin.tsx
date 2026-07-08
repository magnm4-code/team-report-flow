import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/lib/storage';
import { Team } from '@/types';
import { Plus, Edit, Trash2, Eye, FileEdit, Copy, Home, Settings, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => setTeams(await getTeams());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    await createTeam(teamName.trim(), teamPasscode.trim() || undefined);
    await loadTeams();
    setTeamName(''); setTeamPasscode(''); setCreateDialogOpen(false);
    toast({ title: t('admin.createdToast'), description: t('admin.createdToastDesc', { name: teamName }) });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !teamName.trim()) return;
    await updateTeam(selectedTeam.id, teamName.trim(), teamPasscode.trim() || undefined);
    await loadTeams();
    setEditDialogOpen(false); setSelectedTeam(null);
    toast({ title: t('admin.updatedToast'), description: t('admin.updatedToastDesc') });
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;
    await deleteTeam(selectedTeam.id);
    await loadTeams();
    setDeleteDialogOpen(false); setSelectedTeam(null);
    toast({ title: t('admin.deletedToast'), description: t('admin.deletedToastDesc') });
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team); setTeamName(team.name); setTeamPasscode(team.passcode || ''); setEditDialogOpen(true);
  };
  const openDeleteDialog = (team: Team) => { setSelectedTeam(team); setDeleteDialogOpen(true); };

  const copyTeamId = (teamId: number) => {
    navigator.clipboard.writeText(String(teamId));
    toast({ title: t('common.copied'), description: t('admin.idCopied') });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.title')} subtitle={t('admin.subtitle')}>
        <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/admin/settings')}>
          <Settings className="w-4 h-4 me-2" />{t('admin.settings')}
        </Button>
        <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 me-2" />{t('common.home')}
        </Button>
        <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 me-2" />{t('common.signOut')}
        </Button>
      </Header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{teams.length}</div>
              <div className="text-sm text-muted-foreground">{t('admin.totalTeams')}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('admin.teams')}</CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-teal"><Plus className="w-4 h-4 me-2" />{t('admin.addTeam')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{t('admin.newTeamTitle')}</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newTeamName">{t('admin.teamName')}</Label>
                    <Input id="newTeamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t('admin.teamNamePlaceholder')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newTeamPasscode">{t('admin.teamPasscode')}</Label>
                    <Input id="newTeamPasscode" value={teamPasscode} onChange={(e) => setTeamPasscode(e.target.value)} placeholder={t('admin.teamPasscodePlaceholder')} />
                  </div>
                  <Button type="submit" className="w-full btn-teal">{t('admin.createTeam')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('admin.noTeams')}</p><p className="text-sm mt-2">{t('admin.noTeamsHint')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>{t('admin.colTeamName')}</TableHead>
                    <TableHead>{t('admin.colTeamId')}</TableHead>
                    <TableHead>{t('admin.colPasscode')}</TableHead>
                    <TableHead>{t('admin.colCreated')}</TableHead>
                    <TableHead>{t('admin.colUpdated')}</TableHead>
                    <TableHead>{t('admin.colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id} className="animate-fade-in">
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{team.id}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyTeamId(team.id)}><Copy className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.passcode ? (
                          <span className="badge-purple text-xs px-2 py-1 rounded">{t('admin.protected')}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">{t('admin.noPasscode')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(team.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(team.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-secondary/80" asChild>
                            <Link to={`/team/${team.id}/fill/tasks`}><FileEdit className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent/80" asChild>
                            <Link to={`/team/${team.id}/view/tasks`}><Eye className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(team)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => openDeleteDialog(team)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t('admin.editTeam')}</DialogTitle></DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTeamName">{t('admin.teamName')}</Label>
                <Input id="editTeamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t('admin.teamNamePlaceholder')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTeamPasscode">{t('admin.teamPasscode')}</Label>
                <Input id="editTeamPasscode" value={teamPasscode} onChange={(e) => setTeamPasscode(e.target.value)} placeholder={t('admin.editPasscodePlaceholder')} />
              </div>
              <Button type="submit" className="w-full btn-teal">{t('common.saveChanges')}</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t('admin.deleteTeam')}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">{t('admin.deleteConfirm', { name: selectedTeam?.name })}</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
