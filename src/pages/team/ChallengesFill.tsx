import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getChallenges, saveChallenges } from '@/lib/storage';
import { Challenge } from '@/types';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ChallengesFill = () => {
  const { teamId } = useParams();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Challenge | null>(null);
  const [selectedItem, setSelectedItem] = useState<Challenge | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');

  useEffect(() => {
    if (teamId) {
      setChallenges(getChallenges(teamId));
    }
  }, [teamId]);

  const resetForm = () => {
    setText('');
    setSupportNeeded('');
    setEditingItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: Challenge) => {
    setEditingItem(item);
    setText(item.text);
    setSupportNeeded(item.supportNeeded || '');
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !text.trim()) return;

    const now = new Date().toISOString();
    
    if (editingItem) {
      const updated = challenges.map(c =>
        c.id === editingItem.id
          ? {
              ...c,
              text: text.trim(),
              supportNeeded: supportNeeded.trim() || undefined,
              updatedAt: now,
            }
          : c
      );
      setChallenges(updated);
      saveChallenges(teamId, updated);
      toast({ title: 'تم تحديث التحدي' });
    } else {
      const newItem: Challenge = {
        id: crypto.randomUUID(),
        teamId,
        text: text.trim(),
        supportNeeded: supportNeeded.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...challenges, newItem];
      setChallenges(updated);
      saveChallenges(teamId, updated);
      toast({ title: 'تمت إضافة التحدي' });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!teamId || !selectedItem) return;
    
    const updated = challenges.filter(c => c.id !== selectedItem.id);
    setChallenges(updated);
    saveChallenges(teamId, updated);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    toast({ title: 'تم حذف التحدي' });
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          التحديات والصعوبات
        </CardTitle>
        <Button className="btn-teal" onClick={openAddDialog}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة تحدي
        </Button>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد تحديات مسجلة</p>
            <p className="text-sm mt-2">أضف التحديات والصعوبات التي تواجه الفريق</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-foreground font-medium">{item.text}</p>
                    {item.supportNeeded && (
                      <div className="mt-3 p-3 bg-highlight/10 border border-highlight/20 rounded">
                        <p className="text-sm text-highlight font-medium mb-1">الدعم المطلوب:</p>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                          {item.supportNeeded}
                        </p>
                      </div>
                    )}
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
            <DialogTitle>{editingItem ? 'تعديل التحدي' : 'إضافة تحدي جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>وصف التحدي أو الصعوبة</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="أدخل وصف التحدي"
                className="input-rtl min-h-32"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>الدعم أو الإجراء المطلوب (اختياري)</Label>
              <Textarea
                value={supportNeeded}
                onChange={(e) => setSupportNeeded(e.target.value)}
                placeholder="أدخل الدعم المطلوب لحل هذا التحدي"
                className="input-rtl min-h-24"
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
            <DialogTitle>حذف التحدي</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            هل أنت متأكد من حذف هذا التحدي؟
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

export default ChallengesFill;
