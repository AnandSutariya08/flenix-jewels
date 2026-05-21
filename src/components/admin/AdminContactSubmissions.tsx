import { useState, useEffect } from 'react';
import { subscribeContactSubmissions, markContactSubmissionRead, deleteContactSubmission, ContactSubmission } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mail, MailOpen, User, Clock, MessageSquare, AtSign, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    const unsub = subscribeContactSubmissions((data) => {
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpen = async (sub: ContactSubmission) => {
    setSelected(sub);
    if (!sub.read) {
      await markContactSubmissionRead(sub.id, true);
      setSubmissions((prev) =>
        prev.map((s) => s.id === sub.id ? { ...s, read: true } : s)
      );
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteContactSubmission(id);
      if (selected?.id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(null);
    }
  };

  const handleMarkUnread = async (sub: ContactSubmission) => {
    await markContactSubmissionRead(sub.id, false);
    setSubmissions((prev) =>
      prev.map((s) => s.id === sub.id ? { ...s, read: false } : s)
    );
    if (selected?.id === sub.id) setSelected({ ...sub, read: false });
  };

  const unreadCount = submissions.filter((s) => !s.read).length;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' • ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Contact Messages</h2>
            {unreadCount > 0 && (
              <Badge className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(196,144,106,0.18)', color: '#9B6844', border: '1px solid rgba(196,144,106,0.3)' }}>
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Messages submitted via the contact form — updates in real time.</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(196,144,106,0.08)' }} />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.2)' }}>
            <MessageSquare className="h-7 w-7" style={{ color: '#C4906A' }} />
          </div>
          <p className="font-semibold text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {submissions.map((sub) => (
            <Card
              key={sub.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              style={{
                border: sub.read ? '1px solid rgba(196,144,106,0.12)' : '1px solid rgba(196,144,106,0.4)',
                background: sub.read ? undefined : 'rgba(196,144,106,0.04)',
              }}
              onClick={() => handleOpen(sub)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {sub.read
                      ? <MailOpen className="h-4 w-4 text-muted-foreground" />
                      : <Mail className="h-4 w-4" style={{ color: '#C4906A' }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-bold text-sm truncate ${!sub.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {sub.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate hidden sm:block">
                          {sub.email}
                        </span>
                        {sub.phone && (
                          <span className="text-xs text-muted-foreground truncate hidden md:block">
                            · {sub.phone}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatDate(sub.submittedAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${!sub.read ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {sub.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {sub.message}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0"
                    onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}
                    disabled={deleting === sub.id}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selected.subject}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Sender info — all fields */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(196,144,106,0.08)', border: '1px solid rgba(196,144,106,0.14)' }}>
                  <User className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-widest uppercase font-black text-muted-foreground">Name</p>
                    <p className="text-sm font-bold truncate">{selected.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(196,144,106,0.08)', border: '1px solid rgba(196,144,106,0.14)' }}>
                  <AtSign className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-widest uppercase font-black text-muted-foreground">Email</p>
                    <a href={`mailto:${selected.email}`}
                      className="text-sm font-bold hover:underline truncate block"
                      style={{ color: '#C4906A' }}>
                      {selected.email}
                    </a>
                  </div>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(196,144,106,0.08)', border: '1px solid rgba(196,144,106,0.14)' }}>
                    <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-widest uppercase font-black text-muted-foreground">Phone</p>
                      <a href={`tel:${selected.phone}`}
                        className="text-sm font-bold hover:underline truncate block"
                        style={{ color: '#C4906A' }}>
                        {selected.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(196,144,106,0.08)', border: '1px solid rgba(196,144,106,0.14)' }}>
                  <Clock className="h-4 w-4 flex-shrink-0" style={{ color: '#C4906A' }} />
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-widest uppercase font-black text-muted-foreground">Received</p>
                    <p className="text-sm font-bold">{formatDate(selected.submittedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div>
                <p className="text-[10px] tracking-widest uppercase font-black text-muted-foreground mb-2">Message</p>
                <div className="p-5 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ background: 'rgba(196,144,106,0.06)', border: '1px solid rgba(196,144,106,0.14)' }}>
                  {selected.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkUnread(selected)}
                    disabled={!selected.read}
                  >
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    Mark as Unread
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                      Reply by Email
                    </a>
                  </Button>
                  {selected.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${selected.phone}`}>
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting === selected.id}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminContactSubmissions;
