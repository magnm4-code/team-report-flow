import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getAchievements, saveAchievements } from '@/lib/storage';
import { Achievement } from '@/types';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AchievementsFill = () => {
  const { teamId } = useParams();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (teamId) {
      setAchievements(getAchievements(teamId));
    }
  }, [teamId]);

  const resetForm = () => {
    setText('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: Achievement) => {
    setEditingItem(item);
    setText(item.text);
    setDate(item.date);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !text.trim()) return;

    const now = new Date().toISOString();
    
    if (editingItem) {
      const updated = achievements.map(a =>
        a.id === editingItem.id
          ? { ...a, text: text.trim(), date, updatedAt: now }
          : a
      );
      setAchievements(updated);
      saveAchievements(teamId, updated);
      toast({ title: 'تم تحديث الإنجاز' });
    } else {
      const newItem: Achievement = {
        id: crypto.randomUUID(),
        teamId,
        text: text.trim(),
        date,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...achievements, newItem];
      setAchievements(updated);
      saveAchievements(teamId, updated);
      toast({ title: 'تمت إضافة الإنجاز' });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!teamId || !selectedItem) return;
    
    const updated = achievements.filter(a => a.id !== selectedItem.id);
    setAchievements(updated);
    saveAchievements(teamId, updated);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    toast({ title: 'تم حذف الإنجاز' });
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-success" />
          المهام المنجزة لهذا الأسبوع
        </CardTitle>
        <Button className="btn-teal" onClick={openAddDialog}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة إنجاز
        </Button>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد إنجازات مسجلة</p>
            <p className="text-sm mt-2">أضف إنجازات الفريق أو أنجز مهام من صفحة المهام</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-success/5 border border-success/20 rounded-lg animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-foreground">{item.text}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      التاريخ: {item.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                      onClick={() => {
                        setSelectedItem(item);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل الإنجاز' : 'إضافة إنجاز جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>وصف الإنجاز</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="أدخل وصف الإنجاز"
                className="input-rtl min-h-32"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="btn-teal">
                {editingItem ? 'حفظ التغييرات' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>حذف الإنجاز</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            هل أنت متأكد من حذف هذا الإنجاز؟
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
    </Card>
  );
};

export default AchievementsFill;
