import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getTeam, verifyTeamPasscode } from '@/lib/storage';
import { Shield, Users, FileText, ClipboardList, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useLayoutOrder } from '@/hooks/useLayoutOrder';
import SortableItem from '@/components/dnd/SortableItem';

type CardId = 'admin' | 'reports' | 'team';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [teamId, setTeamId] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [cardOrder, setCardOrder] = useLayoutOrder<CardId>('home-cards-order', ['admin', 'reports', 'team']);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleTeamAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericId = Number(teamId.trim());
    if (isNaN(numericId)) {
      toast({ title: t('home.invalidId'), description: t('home.invalidIdDesc'), variant: 'destructive' });
      return;
    }
    const team = await getTeam(numericId);
    if (!team) {
      toast({ title: t('home.teamNotFound'), description: t('home.teamNotFoundDesc'), variant: 'destructive' });
      return;
    }
    if (team.passcode) {
      const valid = await verifyTeamPasscode(numericId, teamPasscode);
      if (!valid) {
        toast({ title: t('home.wrongPasscode'), description: t('home.wrongPasscodeDesc'), variant: 'destructive' });
        return;
      }
    }
    navigate(`/team/${numericId}/fill/tasks`);
    setTeamDialogOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.indexOf(active.id as CardId);
      const newIndex = cardOrder.indexOf(over.id as CardId);
      setCardOrder(arrayMove(cardOrder, oldIndex, newIndex));
    }
  };

  const renderCard = (id: CardId) => {
    switch (id) {
      case 'admin':
        return (
          <Card className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full" onClick={() => navigate('/auth')}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('home.adminPanel')}</CardTitle>
              <CardDescription>{t('home.adminPanelDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{t('common.clickToEnter')}</span>
            </CardContent>
          </Card>
        );
      case 'reports':
        return (
          <Card className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full" onClick={() => navigate('/reports')}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">{t('home.viewReports')}</CardTitle>
              <CardDescription>{t('home.viewReportsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">{t('common.clickToView')}</span>
            </CardContent>
          </Card>
        );
      case 'team':
        return (
          <Card className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full" onClick={() => setTeamDialogOpen(true)}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">{t('home.teamAccess')}</CardTitle>
              <CardDescription>{t('home.teamAccessDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-secondary transition-colors">{t('common.clickToEnter')}</span>
            </CardContent>
          </Card>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary text-primary-foreground">
        <Header />
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg opacity-80">{t('home.tagline')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              {cardOrder.map((id) => (<SortableItem key={id} id={id}>{renderCard(id)}</SortableItem>))}
            </div>
          </SortableContext>
        </DndContext>

        <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t('home.teamDialogTitle')}</DialogTitle></DialogHeader>
            <form onSubmit={handleTeamAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">{t('home.teamId')}</Label>
                <Input id="teamId" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder={t('home.teamIdPlaceholder')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamPasscode">{t('home.teamPasscode')}</Label>
                <Input id="teamPasscode" type="password" value={teamPasscode} onChange={(e) => setTeamPasscode(e.target.value)} placeholder={t('home.teamPasscodePlaceholder')} />
              </div>
              <Button type="submit" className="w-full btn-teal">{t('home.enter')}</Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">{t('home.featuresTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-success/20 flex items-center justify-center"><ClipboardList className="w-6 h-6 text-success" /></div>
              <h3 className="font-semibold mb-2">{t('home.featTasks')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.featTasksDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-highlight/20 flex items-center justify-center"><Trophy className="w-6 h-6 text-highlight" /></div>
              <h3 className="font-semibold mb-2">{t('home.featAchievements')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.featAchievementsDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-destructive/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-destructive" /></div>
              <h3 className="font-semibold mb-2">{t('home.featChallenges')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.featChallengesDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
