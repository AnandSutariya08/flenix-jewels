import { useState, useEffect } from 'react';
import {
  subscribeAllTestimonials,
  saveTestimonial,
  approveTestimonial,
  deleteTestimonial,
  Testimonial,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Quote, Pencil, Star, Check, Clock, User, AtSign, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Tab = 'published' | 'pending';

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-1.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-6 w-6 cursor-pointer transition-colors ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`}
        onClick={() => onChange(star)}
      />
    ))}
  </div>
);

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tab, setTab] = useState<Tab>('pending');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAllTestimonials(setTestimonials);
    return () => unsub();
  }, []);

  const published = testimonials.filter((t) => t.approved !== false);
  const pending = testimonials.filter((t) => t.approved === false);
  const displayed = tab === 'pending' ? pending : published;

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setText('');
    setLocation('');
    setRating(5);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setName(t.name);
    setText(t.text);
    setLocation(t.location || '');
    setRating(t.rating);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) {
      toast.error('Name and review text are required');
      return;
    }
    setSaving(true);
    try {
      const item: Testimonial = {
        id: editingId || Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        rating,
        approved: true,
        source: 'admin',
        ...(location.trim() ? { location: location.trim() } : {}),
        submittedAt: editingId
          ? (testimonials.find((t) => t.id === editingId)?.submittedAt ?? Date.now())
          : Date.now(),
      };
      await saveTestimonial(item);
      resetForm();
      setIsFormOpen(false);
      toast.success(editingId ? 'Testimonial updated' : 'Testimonial added');
    } catch {
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (t: Testimonial) => {
    setApprovingId(t.id);
    try {
      await approveTestimonial(t.id);
      toast.success(`${t.name}'s review approved and published`);
    } catch {
      toast.error('Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      toast.success('Testimonial deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Testimonials</h2>
          <p className="text-sm text-muted-foreground">
            Approve customer reviews before they appear on the website.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(196,144,106,0.1)', border: '1px solid rgba(196,144,106,0.2)' }}>
        {(['pending', 'published'] as Tab[]).map((t) => {
          const count = t === 'pending' ? pending.length : published.length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={active ? { background: '#C4906A', color: '#fff' } : { color: '#9B8070' }}
            >
              {t === 'pending' ? <Clock className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {count > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={active ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: 'rgba(196,144,106,0.2)', color: '#9B6844' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.2)' }}>
            {tab === 'pending' ? <Clock className="h-7 w-7" style={{ color: '#C4906A' }} /> : <Quote className="h-7 w-7" style={{ color: '#C4906A' }} />}
          </div>
          <p className="font-semibold text-muted-foreground">
            {tab === 'pending' ? 'No pending reviews' : 'No published testimonials yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {tab === 'pending'
              ? 'Customer reviews submitted from the website will appear here.'
              : 'Approved reviews will show here and on the website.'}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((t) => (
          <Card key={t.id} className="relative overflow-hidden"
            style={{ border: t.approved === false ? '1px solid rgba(196,144,106,0.35)' : '1px solid rgba(196,144,106,0.15)' }}>
            {t.source === 'customer' && (
              <div className="absolute top-3 right-3">
                <Badge className="text-[10px] font-black px-2 py-0.5"
                  style={{ background: 'rgba(196,144,106,0.15)', color: '#9B6844', border: '1px solid rgba(196,144,106,0.3)' }}>
                  Customer
                </Badge>
              </div>
            )}
            <CardContent className="p-5 space-y-3">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                ))}
              </div>

              <p className="text-sm italic text-muted-foreground line-clamp-3">"{t.text}"</p>

              {/* Sender info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <p className="font-bold text-sm">{t.name}</p>
                </div>
                {t.email && (
                  <div className="flex items-center gap-1.5">
                    <AtSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                  </div>
                )}
                {t.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                )}
                {t.submittedAt && (
                  <p className="text-[10px] text-muted-foreground">{formatDate(t.submittedAt)}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {t.approved === false && (
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    style={{ background: '#C4906A', color: '#fff' }}
                    onClick={() => handleApprove(t)}
                    disabled={approvingId === t.id}
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    {approvingId === t.id ? 'Approving…' : 'Approve'}
                  </Button>
                )}
                {t.approved !== false && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleEdit(t)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {deletingId === t.id ? 'Deleting…' : 'Reject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsFormOpen(v); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Johnson" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mumbai, India" maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label>Review *</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter customer review…" rows={4} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { resetForm(); setIsFormOpen(false); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add & Publish'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestimonials;
