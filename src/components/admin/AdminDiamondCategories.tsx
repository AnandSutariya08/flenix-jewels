import { useEffect, useState } from 'react';
import {
  getDiamondCategories,
  saveDiamondCategory,
  deleteDiamondCategory,
  type DiamondCategory,
  uploadImageToStorage,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminDiamondCategories = () => {
  const [categories, setCategories] = useState<DiamondCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getDiamondCategories().then(setCategories);
  }, []);

  const usedPriorities = categories
    .filter((category) => category.id !== editingId)
    .map((category) => category.priority)
    .filter((value): value is number => value !== undefined);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setPriority(1);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (category: DiamondCategory) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image);
    setPriority(category.priority || 1);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!name || (!imageFile && !editingId)) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile, 'diamond-categories');
      }

      const payload: DiamondCategory = {
        id: editingId || Date.now().toString(),
        name,
        description,
        image: imageUrl,
        priority,
      };

      await saveDiamondCategory(payload);
      setCategories(await getDiamondCategories());
      resetForm();
      setIsFormOpen(false);
      toast.success(editingId ? 'Diamond category updated' : 'Diamond category added');
    } catch {
      toast.error(editingId ? 'Failed to update diamond category' : 'Failed to add diamond category');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteDiamondCategory(id);
      setCategories(await getDiamondCategories());
      toast.success('Diamond category deleted');
    } catch {
      toast.error('Failed to delete diamond category');
    } finally {
      setIsDeleting(null);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Diamond Categories</h2>
          <p className="text-sm text-muted-foreground">Create category filters for the Diamond page.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Diamond Category
        </Button>
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsFormOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Diamond Category' : 'Add Diamond Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamond-category-name">Category Name *</Label>
                <Input
                  id="diamond-category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Solitaire, Studs, Loose Stones"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diamond-category-priority">Display Priority *</Label>
                <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value, 10))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <SelectItem key={value} value={value.toString()} disabled={usedPriorities.includes(value)}>
                        {value} {usedPriorities.includes(value) ? '(Used)' : value === 1 ? '(First)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond-category-description">Description</Label>
              <Textarea
                id="diamond-category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short category description for the Diamond page."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond-category-image">Image *</Label>
              <Input
                id="diamond-category-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {image ? <img src={image} alt="Preview" className="h-32 w-auto rounded-lg mt-2" /> : null}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { resetForm(); setIsFormOpen(false); }} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                <Plus className="h-4 w-4 mr-2" />
                {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Category' : 'Add Category')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCategories.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
              #{category.priority || '-'}
            </span>
            <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)} disabled={isDeleting === category.id}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} disabled={isDeleting === category.id}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === category.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDiamondCategories;
