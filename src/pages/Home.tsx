import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { verifyAdminPassword, getTeam, verifyTeamPasscode, getSettings } from '@/lib/storage';
import { Shield, Users, FileText, ClipboardList, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useLayoutOrder } from '@/hooks/useLayoutOrder';
import SortableItem from '@/components/dnd/SortableItem';

type CardId = 'admin' | 'reports' | 'team';

const Home = () => {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [settings, setSettings] = useState<{ headerTitle: string; headerSubtitle: string; featuresTitle?: string }>({ headerTitle: 'التقرير الأسبوعي', headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق', featuresTitle: 'مميزات النظام' });
  const [cardOrder, setCardOrder] = useLayoutOrder<CardId>('home-cards-order', ['admin', 'reports', 'team']);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(adminPassword)) {
      navigate('/admin');
      setAdminDialogOpen(false);
    } else {
      toast({
        title: 'خطأ في المصادقة',
        description: 'كلمة المرور غير صحيحة',
        variant: 'destructive',
      });
    }
  };

  const handleTeamAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const team = getTeam(teamId.trim());
    
    if (!team) {
      toast({
        title: 'فريق غير موجود',
        description: 'يرجى التحقق من معرف الفريق',
        variant: 'destructive',
      });
      return;
    }

    if (team.passcode && !verifyTeamPasscode(teamId, teamPasscode)) {
      toast({
        title: 'رمز الدخول غير صحيح',
        description: 'يرجى إدخال رمز الدخول الصحيح',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/team/${teamId}/fill/tasks`);
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
          <Card 
            className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
            onClick={() => setAdminDialogOpen(true)}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">لوحة الإدارة</CardTitle>
              <CardDescription>إدارة الفرق والتقارير</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                انقر للدخول ←
              </span>
            </CardContent>
          </Card>
        );
      case 'reports':
        return (
          <Card 
            className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
            onClick={() => navigate('/reports')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">عرض التقارير</CardTitle>
              <CardDescription>استعراض تقارير جميع الفرق</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
                انقر للعرض ←
              </span>
            </CardContent>
          </Card>
        );
      case 'team':
        return (
          <Card 
            className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
            onClick={() => setTeamDialogOpen(true)}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">دخول الفريق</CardTitle>
              <CardDescription>الوصول إلى تقرير فريقك</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-sm text-muted-foreground group-hover:text-secondary transition-colors">
                انقر للدخول ←
              </span>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-primary text-primary-foreground">
        <Header />
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg opacity-80">
              تتبع المهام والإنجازات والتحديات بسهولة
            </p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="container mx-auto px-4 py-16">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              {cardOrder.map((id) => (
                <SortableItem key={id} id={id}>
                  {renderCard(id)}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Admin Dialog */}
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل دخول المسؤول</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">كلمة المرور</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="input-rtl"
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-teal">
                دخول
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Team Dialog */}
        <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>الدخول إلى تقرير الفريق</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTeamAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">معرف الفريق</Label>
                <Input
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="أدخل معرف الفريق"
                  className="input-rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamPasscode">رمز الدخول (اختياري)</Label>
                <Input
                  id="teamPasscode"
                  type="password"
                  value={teamPasscode}
                  onChange={(e) => setTeamPasscode(e.target.value)}
                  placeholder="أدخل رمز الدخول إذا كان مطلوباً"
                  className="input-rtl"
                />
              </div>
              <Button type="submit" className="w-full btn-teal">
                دخول
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">{settings.featuresTitle || 'مميزات النظام'}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-success/20 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">إدارة المهام</h3>
              <p className="text-sm text-muted-foreground">
                تتبع المهام ونسب الإنجاز والتقدم الأسبوعي
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-highlight/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-highlight" />
              </div>
              <h3 className="font-semibold mb-2">توثيق الإنجازات</h3>
              <p className="text-sm text-muted-foreground">
                سجل الإنجازات الأسبوعية للفريق
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">رصد التحديات</h3>
              <p className="text-sm text-muted-foreground">
                توثيق الصعوبات والدعم المطلوب
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
