import { useEffect, useState, type ChangeEvent } from 'react';
import {
  getAds,
  saveAdCampaign,
  deleteAdCampaign,
  uploadImageToStorage,
  type AdCampaign,
} from '@/lib/storage';
import { useAppDispatch } from '@/store/hooks';
import { loadGlobalData } from '@/store/contentSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Megaphone, ImagePlus, PlayCircle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminAds = () => {
  const dispatch = useAppDispatch();
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCreatedAt, setEditingCreatedAt] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [active, setActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const refreshAds = async () => {
    const nextAds = await getAds();
    setAds(nextAds);
  };

  useEffect(() => {
    refreshAds();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setEditingCreatedAt(undefined);
    setTitle('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setActive(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (ad: AdCampaign) => {
    setEditingId(ad.id);
    setEditingCreatedAt(ad.createdAt);
    setTitle(ad.title || '');
    setDescription(ad.description || '');
    setImage(ad.image || '');
    setImageFile(null);
    setActive(Boolean(ad.active));
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() && !description.trim() && !imageFile && !image) {
      toast.error('Add title, description, or an image for the ad');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'ads', true);
      }

      const now = Date.now();
      const adData: AdCampaign = {
        id: editingId || now.toString(),
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        active,
        createdAt: editingCreatedAt || now,
        updatedAt: now,
      };

      await saveAdCampaign(adData);
      await refreshAds();
      dispatch(loadGlobalData({ force: true }));
      setIsFormOpen(false);
      resetForm();
      toast.success(active ? 'Ad saved and set live' : 'Ad saved successfully');
    } catch (error) {
      toast.error(editingId ? 'Failed to update ad' : 'Failed to create ad');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteAdCampaign(id);
      await refreshAds();
      dispatch(loadGlobalData({ force: true }));
      toast.success('Ad deleted');
    } catch (error) {
      toast.error('Failed to delete ad');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleActive = async (ad: AdCampaign, nextActive: boolean) => {
    setIsToggling(ad.id);
    try {
      await saveAdCampaign({
        ...ad,
        active: nextActive,
        updatedAt: Date.now(),
      });
      await refreshAds();
      dispatch(loadGlobalData({ force: true }));
      toast.success(nextActive ? 'Ad is now live' : 'Ad turned off');
    } catch (error) {
      toast.error('Failed to update ad status');
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Website Ads</h2>
          <p className="text-sm text-muted-foreground">
            Create popup ads for the website. Only one ad can run live at a time.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ad
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(next) => { if (!next) resetForm(); setIsFormOpen(next); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Ad' : 'Create Ad'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-title">Title</Label>
                <Input
                  id="ad-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Diamond Offer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-image">Ad Image</Label>
                <Input
                  id="ad-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-description">Description</Label>
              <Textarea
                id="ad-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the text you want users to see in the popup."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                You can create a text-only ad, image-only ad, or use both together.
              </p>
            </div>

            {image && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <img
                  src={image}
                  alt={title || 'Ad preview'}
                  className="w-full max-h-64 object-cover rounded-xl border"
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Run this ad live</p>
                <p className="text-xs text-muted-foreground">
                  If turned on, any other live ad will be turned off automatically.
                </p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Megaphone className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : editingId ? 'Update Ad' : 'Create Ad'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ads.length === 0 && (
          <Card className="xl:col-span-2">
            <CardContent className="py-14 text-center">
              <ImagePlus className="h-9 w-9 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No ads yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first website popup ad and choose when it should go live.
              </p>
            </CardContent>
          </Card>
        )}

        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden">
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.title || 'Website ad'}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-[#1c120d] via-[#3a2416] to-[#c4906a] text-white">
                <div className="text-center px-6">
                  <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-80" />
                  <p className="text-lg font-semibold">{ad.title || 'Text Ad'}</p>
                </div>
              </div>
            )}

            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{ad.title || 'Untitled Ad'}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {ad.description || 'No description added for this ad.'}
                  </p>
                </div>
                <Badge variant={ad.active ? 'default' : 'secondary'}>
                  {ad.active ? 'Live' : 'Draft'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={ad.active ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleToggleActive(ad, !ad.active)}
                  disabled={isToggling === ad.id}
                >
                  {ad.active ? (
                    <PauseCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  )}
                  {isToggling === ad.id ? 'Updating...' : ad.active ? 'Turn Off' : 'Set Live'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ad)}
                  disabled={isDeleting === ad.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(ad.id)}
                  disabled={isDeleting === ad.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === ad.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAds;
