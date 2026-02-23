import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSettings, saveSettings, getDefaultThemeColors, applyThemeColors } from '@/lib/storage';
import { Settings, ThemeColors } from '@/types';
import { Save, ArrowRight, Upload, RotateCcw, Palette, Type, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import ColorPicker from '@/components/admin/ColorPicker';
import { useAuth } from '@/contexts/AuthContext';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettingsState] = useState<Settings>({
    headerTitle: 'التقرير الأسبوعي',
    headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق',
    logoUrl: '',
    themeColors: getDefaultThemeColors(),
    featuresTitle: 'مميزات النظام',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    getSettings().then((s) => {
      setSettingsState(s);
      if (s.themeColors) applyThemeColors(s.themeColors);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات النظام بنجاح' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'خطأ', description: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettingsState({ ...settings, logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const newColors = { ...settings.themeColors, [key]: value } as ThemeColors;
    setSettingsState({ ...settings, themeColors: newColors });
    applyThemeColors(newColors);
  };

  const resetColors = () => {
    const defaultColors = getDefaultThemeColors();
    setSettingsState({ ...settings, themeColors: defaultColors });
    applyThemeColors(defaultColors);
    toast({ title: 'تم إعادة التعيين', description: 'تم استعادة الألوان الافتراضية' });
  };

  const removeLogo = () => {
    setSettingsState({ ...settings, logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header title="إعدادات النظام" subtitle="تخصيص مظهر التطبيق">
        <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/admin')}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للإدارة
        </Button>
      </Header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave}>
          <Tabs defaultValue="text" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="text" className="flex items-center gap-2"><Type className="w-4 h-4" />النصوص</TabsTrigger>
              <TabsTrigger value="logo" className="flex items-center gap-2"><Image className="w-4 h-4" />الشعار</TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center gap-2"><Palette className="w-4 h-4" />الألوان</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>إعدادات النصوص</CardTitle>
                  <CardDescription>تخصيص عناوين ونصوص النظام</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="headerTitle">عنوان النظام الرئيسي</Label>
                    <Input id="headerTitle" value={settings.headerTitle} onChange={(e) => setSettingsState({ ...settings, headerTitle: e.target.value })} placeholder="أدخل عنوان النظام" className="input-rtl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headerSubtitle">الوصف الفرعي</Label>
                    <Input id="headerSubtitle" value={settings.headerSubtitle} onChange={(e) => setSettingsState({ ...settings, headerSubtitle: e.target.value })} placeholder="أدخل الوصف الفرعي" className="input-rtl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featuresTitle">عنوان قسم المميزات</Label>
                    <Input id="featuresTitle" value={settings.featuresTitle || ''} onChange={(e) => setSettingsState({ ...settings, featuresTitle: e.target.value })} placeholder="أدخل عنوان قسم المميزات" className="input-rtl" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logo">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>إعدادات الشعار</CardTitle>
                  <CardDescription>تخصيص شعار النظام</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>شعار النظام</Label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Image className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logoUpload" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 ml-2" />رفع شعار جديد
                        </Button>
                        {settings.logoUrl && (
                          <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={removeLogo}>إزالة الشعار</Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">يُفضل استخدام صورة بخلفية شفافة (PNG) بحجم أقصى 2 ميجابايت</p>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">أو أدخل رابط الشعار</Label>
                      <Input id="logoUrl" value={settings.logoUrl || ''} onChange={(e) => setSettingsState({ ...settings, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" dir="ltr" className="font-mono text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors">
              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>إعدادات الألوان</CardTitle>
                    <CardDescription>تخصيص ألوان النظام</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={resetColors}>
                    <RotateCcw className="w-4 h-4 ml-2" />استعادة الافتراضي
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <ColorPicker label="اللون الأساسي (Primary)" value={settings.themeColors?.primary || getDefaultThemeColors().primary} onChange={(value) => handleColorChange('primary', value)} />
                    <ColorPicker label="اللون الثانوي (Secondary)" value={settings.themeColors?.secondary || getDefaultThemeColors().secondary} onChange={(value) => handleColorChange('secondary', value)} />
                    <ColorPicker label="لون التمييز (Accent)" value={settings.themeColors?.accent || getDefaultThemeColors().accent} onChange={(value) => handleColorChange('accent', value)} />
                    <ColorPicker label="لون النجاح (Success)" value={settings.themeColors?.success || getDefaultThemeColors().success} onChange={(value) => handleColorChange('success', value)} />
                    <ColorPicker label="لون التمييز الخاص (Highlight)" value={settings.themeColors?.highlight || getDefaultThemeColors().highlight} onChange={(value) => handleColorChange('highlight', value)} />
                  </div>
                  <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
                    <Label className="mb-3 block">معاينة الألوان</Label>
                    <div className="flex flex-wrap gap-3">
                      {(['primary', 'secondary', 'accent', 'success', 'highlight'] as const).map(key => (
                        <div key={key} className="w-16 h-16 rounded-lg shadow-sm flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: `hsl(${settings.themeColors?.[key]})` }}>
                          {key === 'primary' ? 'أساسي' : key === 'secondary' ? 'ثانوي' : key === 'accent' ? 'تمييز' : key === 'success' ? 'نجاح' : 'خاص'}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6">
              <Button type="submit" className="w-full btn-teal" size="lg">
                <Save className="w-5 h-5 ml-2" />حفظ جميع الإعدادات
              </Button>
            </div>
          </Tabs>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
