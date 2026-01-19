import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { verifyAdminPassword, getTeams, verifyTeamPasscode, getTeam } from '@/lib/storage';
import { Shield, Users, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Home = () => {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              التقرير الأسبوعي
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              نظام إدارة التقارير الأسبوعية للفرق
            </p>
            <p className="text-lg opacity-80">
              تتبع المهام والإنجازات والتحديات بسهولة
            </p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Admin Login Card */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">لوحة الإدارة</CardTitle>
              <CardDescription>
                إدارة الفرق والتقارير
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                    دخول المسؤول
                  </Button>
                </DialogTrigger>
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
            </CardContent>
          </Card>

          {/* Manager Reports Card */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">عرض التقارير</CardTitle>
              <CardDescription>
                استعراض تقارير جميع الفرق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => navigate('/reports')}
              >
                عرض التقارير
              </Button>
            </CardContent>
          </Card>

          {/* Team Access Card */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">دخول الفريق</CardTitle>
              <CardDescription>
                الوصول إلى تقرير فريقك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full btn-teal">
                    دخول الفريق
                  </Button>
                </DialogTrigger>
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
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">مميزات النظام</h2>
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

// Import icons for features section
import { ClipboardList, Trophy, AlertTriangle } from 'lucide-react';

export default Home;
