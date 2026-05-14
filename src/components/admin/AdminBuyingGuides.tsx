// src/components/admin/AdminBuyingGuides.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getBuyingGuides, saveBuyingGuide, deleteBuyingGuide, BuyingGuide } from '@/lib/buyingGuides';
import { uploadImageToStorage } from '@/lib/storage';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';

const AdminBuyingGuides = () => {
  const [guides, setGuides] = useState<BuyingGuide[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BuyingGuide | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState<number>(0);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoFaq, setSeoFaq] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => { loadGuides(); }, []);

  const loadGuides = async () => {
    const data = await getBuyingGuides();
    setGuides(data);
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const safeHtml = (html: string) => {
    try {
      const doc = new DOMParser().parseFromString(html || '', 'text/html');
      doc.querySelectorAll('style, link, script').forEach((el) => el.remove());
      doc.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
      doc.querySelectorAll('[face], [color], [size]').forEach((el) => {
        el.removeAttribute('face');
        el.removeAttribute('color');
        el.removeAttribute('size');
      });
      return doc.body.innerHTML;
    } catch {
      return html || '';
    }
  };

  const saveGuide = async (data: {
    title: string;
    content: string;
    imageUrl: string;
    published: boolean;
    order: number;
    metaTitle?: string;
    metaDescription?: string;
    seoFaq?: { question: string; answer: string }[];
  }) => {
    const guide: BuyingGuide = {
      id: editing?.id || Date.now().toString(),
      title: data.title,
      slug: generateSlug(data.title),
      content: data.content,
      image: data.imageUrl,
      order: data.order,
      published: data.published,
      createdAt: editing?.createdAt || new Date(),
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      seoFaq: data.seoFaq && data.seoFaq.length > 0 ? data.seoFaq : undefined,
    };
    await saveBuyingGuide(guide);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return toast.error('Title & content required');
    let finalImageUrl = imageUrl;
    if (image) {
      finalImageUrl = await uploadImageToStorage(image, 'buying-guides');
    }
    await saveGuide({ title, content, imageUrl: finalImageUrl, published, order, metaTitle, metaDescription, seoFaq });
    toast.success(editing ? 'Guide updated' : 'Guide added');
    setOpen(false);
    resetForm();
    loadGuides();
  };

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setImage(null);
    setImageUrl('');
    setPublished(true);
    setOrder(guides.length);
    setMetaTitle('');
    setMetaDescription('');
    setSeoFaq([]);
  };

  const startEdit = (guide: BuyingGuide) => {
    setEditing(guide);
    setTitle(guide.title);
    setContent(guide.content);
    setImageUrl(guide.image);
    setPublished(guide.published);
    setOrder(typeof guide.order === 'number' ? guide.order : 0);
    setMetaTitle(guide.metaTitle || '');
    setMetaDescription(guide.metaDescription || '');
    setSeoFaq(guide.seoFaq || []);
    setOpen(true);
  };

  const removeGuide = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this buying guide?')) {
      try {
        await deleteBuyingGuide(id);
        toast.success('Guide deleted successfully');
        loadGuides();
      } catch {
        toast.error('Failed to delete guide');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Jewelry Buying Guides</h2>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add New Guide
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden">
            <img src={guide.image || '/placeholder.jpg'} alt={guide.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{guide.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Order: {typeof guide.order === 'number' ? guide.order : '-'}</span>
                <span className="mx-1">•</span>
                <span className="font-mono">{guide.slug}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                {guide.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{guide.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(guide)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeGuide(guide.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ─── DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-6xl w-full p-0 overflow-hidden rounded-2xl gap-0"
          style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-background">
            <DialogTitle className="text-lg font-semibold">
              {editing ? 'Edit' : 'Add'} Buying Guide
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Create guides in the same layout as the public Buying Guide page.
            </p>
          </DialogHeader>

          {/* Body: two columns, each independently scrollable */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ── Left: Form ───────────────────────────── */}
            <div className="flex flex-col w-full lg:w-1/2 border-r min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Title + Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Diamond 4Cs Made Simple"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={Number.isFinite(order) ? order : 0}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower shows first.</p>
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label>Slug (auto-generated)</Label>
                  <Input value={generateSlug(title)} readOnly className="font-mono text-muted-foreground bg-muted/40" />
                </div>

                {/* Cover Image */}
                <div className="space-y-1.5">
                  <Label>Cover Image</Label>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-lg border"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                        setImageUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <Label>Content</Label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your guide here… Use headings, lists, links."
                  />
                  <p className="text-xs text-muted-foreground">
                    Renders in the same "prose" style as the public Buying Guide page.
                  </p>
                </div>

                {/* SEO */}
                <div className="space-y-4 pt-2 border-t">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground pt-1">
                    SEO Settings
                  </p>

                  <div className="space-y-1.5">
                    <Label>Meta Title</Label>
                    <Input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO meta title"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Meta Description</Label>
                    <Textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="SEO meta description"
                      rows={3}
                    />
                  </div>

                  {/* FAQ */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>FAQ</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSeoFaq((v) => [...v, { question: '', answer: '' }])}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add FAQ
                      </Button>
                    </div>

                    {seoFaq.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Optional. Add common Q&amp;A for SEO.</p>
                    ) : (
                      seoFaq.map((item, idx) => (
                        <Card key={idx} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              FAQ #{idx + 1}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setSeoFaq((v) => v.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Question</Label>
                            <Input
                              value={item.question}
                              onChange={(e) =>
                                setSeoFaq((v) =>
                                  v.map((it, i) => (i === idx ? { ...it, question: e.target.value } : it))
                                )
                              }
                              placeholder="e.g. Do you ship internationally?"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Answer</Label>
                            <Textarea
                              value={item.answer}
                              onChange={(e) =>
                                setSeoFaq((v) =>
                                  v.map((it, i) => (i === idx ? { ...it, answer: e.target.value } : it))
                                )
                              }
                              placeholder="Your answer…"
                              rows={3}
                            />
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer actions — pinned to bottom of left column */}
              <div className="flex-shrink-0 px-6 py-4 border-t bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Switch checked={published} onCheckedChange={setPublished} />
                  <Label className="cursor-pointer">Publish (Visible on website)</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="min-w-[110px]">Save Guide</Button>
                </div>
              </div>
            </div>

            {/* ── Right: Live Preview ───────────────────── */}
            <div className="hidden lg:flex flex-col w-1/2 min-h-0 bg-muted/30">
              <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b bg-background">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Live Preview
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Banner image */}
                {imageUrl && (
                  <div className="aspect-[21/9] overflow-hidden">
                    <img src={imageUrl} alt={title || 'Preview'} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="px-8 py-6">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {title || <span className="text-muted-foreground/50">Untitled guide</span>}
                  </h3>
                  {metaDescription && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{metaDescription}</p>
                  )}
                  <div className="mt-6 prose prose-neutral dark:prose-invert prose-headings:tracking-tight prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-hr:my-10 max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />
                  </div>

                  {!content && (
                    <div className="mt-8 rounded-xl border-2 border-dashed border-muted-foreground/20 p-10 text-center text-sm text-muted-foreground">
                      Your content will appear here as you type.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 px-5 py-3 border-t bg-background text-xs text-muted-foreground">
                Preview uses the same typography as the public Buying Guide page.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBuyingGuides;