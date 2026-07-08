import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { teamId: teamIdParam } = useParams();
  const teamId = Number(teamIdParam);
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Challenge | null>(null);
  const [selectedItem, setSelectedItem] = useState<Challenge | null>(null);
  const [text, setText] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');

  useEffect(() => { if (teamId) { getChallenges(teamId).then(setChallenges); } }, [teamId]);

  const resetForm = () => { setText(''); setSupportNeeded(''); setEditingItem(null); };
  const openAddDialog = () => { resetForm(); setDialogOpen(true); };
  const openEditDialog = (item: Challenge) => { setEditingItem(item); setText(item.text); setSupportNeeded(item.supportNeeded || ''); setDialogOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !text.trim()) return;
    const now = new Date().toISOString();
    let updated: any[];
    if (editingItem) {
      updated = challenges.map(c => c.id === editingItem.id ? { ...c, text: text.trim(), supportNeeded: supportNeeded.trim() || undefined, updatedAt: now } : c);
      toast({ title: t('challenges.updatedToast') });
    } else {
      updated = [...challenges, { teamId, text: text.trim(), supportNeeded: supportNeeded.trim() || undefined, createdAt: now, updatedAt: now }];
      toast({ title: t('challenges.addedToast') });
    }
    await saveChallenges(teamId, updated);
    setChallenges(await getChallenges(teamId));
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!teamId || !selectedItem) return;
    const updated = challenges.filter(c => c.id !== selectedItem.id);
    setChallenges(updated);
    await saveChallenges(teamId, updated);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    toast({ title: t('challenges.deletedToast') });
  };

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />{t('challenges.title')}</CardTitle>
        <Button className="btn-teal" onClick={openAddDialog}><Plus className="w-4 h-4 me-2" />{t('challenges.addChallenge')}</Button>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>{t('challenges.noChallenges')}</p><p className="text-sm mt-2">{t('challenges.noChallengesHint')}</p></div>
        ) : (
          <div className="space-y-4">
            {challenges.map((item) => (
              <div key={item.id} className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-foreground font-medium">{item.text}</p>
                    {item.supportNeeded && (
                      <div className="mt-3 p-3 bg-highlight/10 border border-highlight/20 rounded">
                        <p className="text-sm text-highlight font-medium mb-1">{t('challenges.supportLabel')}</p>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{item.supportNeeded}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? t('challenges.edit') : t('challenges.addNew')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label>{t('challenges.descField')}</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('challenges.descPlaceholder')} className="min-h-32" required /></div>
            <div className="space-y-2"><Label>{t('challenges.supportField')}</Label><Textarea value={supportNeeded} onChange={(e) => setSupportNeeded(e.target.value)} placeholder={t('challenges.supportPlaceholder')} className="min-h-24" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="btn-teal">{editingItem ? t('common.saveChanges') : t('common.add')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('challenges.deleteTitle')}</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">{t('challenges.confirmDelete')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChallengesFill;
