import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSettings, saveSettings } from '@/lib/storage';
import { Settings } from '@/types';
import { Home, Save, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    headerTitle: 'التقرير الأسبوعي',
    headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق',
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ إعدادات النظام بنجاح',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="إعدادات النظام" subtitle="تخصيص مظهر التطبيق">
        <Button
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => navigate('/admin')}
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للإدارة
        </Button>
      </Header>

      <div className="container mx-auto px-4 py-8">
        <Card className="card-elevated max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>إعدادات الرأسية</CardTitle>
            <CardDescription>تخصيص عنوان ووصف النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="headerTitle">عنوان النظام</Label>
                <Input
                  id="headerTitle"
                  value={settings.headerTitle}
                  onChange={(e) => setSettings({ ...settings, headerTitle: e.target.value })}
                  placeholder="أدخل عنوان النظام"
                  className="input-rtl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerSubtitle">الوصف الفرعي</Label>
                <Input
                  id="headerSubtitle"
                  value={settings.headerSubtitle}
                  onChange={(e) => setSettings({ ...settings, headerSubtitle: e.target.value })}
                  placeholder="أدخل الوصف الفرعي"
                  className="input-rtl"
                />
              </div>
              <Button type="submit" className="w-full btn-teal">
                <Save className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
