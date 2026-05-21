import { useState, useEffect, useMemo } from 'react';
import { getGallery, saveGalleryItem, deleteGalleryItem, GalleryItem, uploadImageToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Pencil, Home, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { loadDeferredData, invalidateDeferredCache } from '@/store/contentSlice';

const HOME_SLOTS = 5;

const AdminGallery = () => {
  const dispatch = useAppDispatch();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sequenceInput, setSequenceInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getGallery().then((items) => {
      setGallery(items);
    });
  }, []);

  const sortedGallery = useMemo(() => {
    return [...gallery].sort((a, b) => {
      if (a.sequence != null && b.sequence != null) return a.sequence - b.sequence;
      if (a.sequence != null) return -1;
      if (b.sequence != null) return 1;
      return 0;
    });
  }, [gallery]);

  const usedSequences = useMemo(() => {
    return new Set(
      gallery
        .filter((g) => g.sequence != null && g.id !== editingId)
        .map((g) => g.sequence as number)
    );
  }, [gallery, editingId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setDescription(item.description || '');
    setCategory(item.category || '');
    setImage(item.image);
    setImageFile(null);
    setSequenceInput(item.sequence != null ? String(item.sequence) : '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setCategory('');
    setImage('');
    setImageFile(null);
    setSequenceInput('');
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!imageFile && !editingId) {
      toast.error('Please select an image');
      return;
    }

    const seqNum = sequenceInput.trim() ? parseInt(sequenceInput.trim(), 10) : undefined;

    if (sequenceInput.trim()) {
      if (isNaN(seqNum!) || seqNum! < 1) {
        toast.error('Sequence must be a number starting from 1');
        return;
      }
      if (usedSequences.has(seqNum!)) {
        toast.error(`Sequence #${seqNum} is already used by another image`);
        return;
      }
    }

    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'gallery');
      }

      const itemData: GalleryItem = {
        id: editingId || Date.now().toString(),
        description,
        category: category.trim() || undefined,
        image: imageUrl,
        ...(seqNum != null ? { sequence: seqNum } : {}),
      };

      await saveGalleryItem(itemData);
      const updated = await getGallery();
      setGallery(updated);
      invalidateDeferredCache();
      dispatch(loadDeferredData({ force: true }));
      resetForm();
      setIsFormOpen(false);
      toast.success(editingId ? 'Image updated' : 'Image added to gallery');
    } catch {
      toast.error(editingId ? 'Failed to update image' : 'Failed to add image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteGalleryItem(id);
      const updated = await getGallery();
      setGallery(updated);
      invalidateDeferredCache();
      dispatch(loadDeferredData({ force: true }));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(null);
    }
  };

  const seqNum = sequenceInput.trim() ? parseInt(sequenceInput.trim(), 10) : undefined;
  const isHomePage = seqNum != null && !isNaN(seqNum) && seqNum >= 1 && seqNum <= HOME_SLOTS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Manage gallery images. Set sequence 1–{HOME_SLOTS} to show on the home page.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
          style={{ background: 'rgba(196,144,106,0.15)', color: '#9B6844', border: '1px solid rgba(196,144,106,0.3)' }}>
          <Home className="h-3 w-3" /> Sequence 1–{HOME_SLOTS} = shown on Home Page
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
          style={{ background: 'rgba(100,100,100,0.1)', color: '#666', border: '1px solid rgba(0,0,0,0.1)' }}>
          <ImageIcon className="h-3 w-3" /> Sequence {HOME_SLOTS + 1}+ = Gallery page only
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
          style={{ background: 'rgba(100,100,100,0.1)', color: '#888', border: '1px solid rgba(0,0,0,0.1)' }}>
          No sequence = shown last in gallery
        </span>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsFormOpen(v); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Gallery Image' : 'Add Gallery Image'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sequence */}
            <div className="space-y-2">
              <Label htmlFor="gallery-sequence">
                Sequence Number
                <span className="ml-2 text-xs text-muted-foreground">(determines display order)</span>
              </Label>
              <Input
                id="gallery-sequence"
                type="number"
                min={1}
                value={sequenceInput}
                onChange={(e) => setSequenceInput(e.target.value)}
                placeholder="e.g. 1, 2, 3…"
              />
              {sequenceInput.trim() && (
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${isHomePage ? 'text-amber-700' : 'text-muted-foreground'}`}>
                  {isHomePage
                    ? <><Home className="h-3 w-3" /> This image will appear on the Home Page (slot #{seqNum})</>
                    : seqNum && !isNaN(seqNum) && seqNum >= 1
                    ? <><ImageIcon className="h-3 w-3" /> This image appears in Gallery page only</>
                    : null}
                </p>
              )}
              {sequenceInput.trim() && usedSequences.has(parseInt(sequenceInput.trim())) && (
                <p className="text-xs text-red-600 font-semibold">
                  ⚠ Sequence #{sequenceInput} is already used. Choose a different number.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="gallery-description">Description (Optional)</Label>
              <Input
                id="gallery-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="gallery-category">Category (Optional)</Label>
              <Input
                id="gallery-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Rings, Necklaces…"
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="gallery-image">Image *</Label>
              <Input
                id="gallery-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {image && (
                <img src={image} alt="Preview" className="h-32 w-auto rounded-lg mt-2 object-cover" />
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancelEdit} variant="outline" disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                <Plus className="h-4 w-4 mr-2" />
                {isUploading
                  ? (editingId ? 'Updating…' : 'Uploading…')
                  : (editingId ? 'Update Image' : 'Add to Gallery')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery grid sorted by sequence */}
      {sortedGallery.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedGallery.map((item) => {
            const isHome = item.sequence != null && item.sequence >= 1 && item.sequence <= HOME_SLOTS;
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.description}
                    className="w-full aspect-square object-cover"
                  />
                  {/* Sequence badge */}
                  {item.sequence != null && (
                    <span
                      className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={isHome
                        ? { background: 'rgba(155,104,68,0.92)', color: '#fff' }
                        : { background: 'rgba(0,0,0,0.65)', color: '#ccc' }
                      }
                    >
                      {isHome && <Home className="h-2.5 w-2.5" />}
                      #{item.sequence}
                    </span>
                  )}
                  {item.sequence == null && (
                    <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#aaa' }}>
                      No seq
                    </span>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{item.description || 'No description'}</p>
                  {item.category && (
                    <p className="text-xs font-semibold" style={{ color: '#9B6844' }}>{item.category}</p>
                  )}
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleEdit(item)}
                      disabled={isDeleting === item.id}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {isDeleting === item.id ? '…' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
