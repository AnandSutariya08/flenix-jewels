import { useEffect, useRef, useState } from 'react';
import {
  getDiamonds,
  saveDiamond,
  deleteDiamond,
  getDiamondCategories,
  uploadImageToStorage,
  type Diamond,
  type DiamondCategory,
  type DiamondType,
  type DiamondShape,
  type DiamondClarity,
  type DiamondGrade,
  type DiamondFluorescence,
  type DiamondCertificate,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, X, Images } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { stripHtml } from '@/lib/seo';
import { formatPriceRounded } from '@/lib/utils';

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  source: 'existing' | 'new';
}

const DIAMOND_TYPE_OPTIONS: Array<{ value: DiamondType; label: string }> = [
  { value: 'real', label: 'Natural Diamond' },
  { value: 'cvd', label: 'Lab Grown Diamond' },
];

const SHAPE_OPTIONS: Array<{ value: DiamondShape; label: string }> = [
  { value: 'round', label: 'Round' },
  { value: 'pear', label: 'Pear' },
  { value: 'marquise', label: 'Marquise' },
  { value: 'oval', label: 'Oval' },
  { value: 'heart', label: 'Heart' },
  { value: 'princess', label: 'Princess' },
  { value: 'cushion', label: 'Cushion' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'sq_emerald', label: 'Sq Emerald' },
  { value: 'radiant', label: 'Radiant' },
  { value: 'sq_radiant', label: 'Sq Radiant' },
  { value: 'other', label: 'Other' },
];

const CLARITY_OPTIONS: Array<{ value: DiamondClarity; label: string }> = [
  { value: 'FL', label: 'FL' },
  { value: 'IF', label: 'IF' },
  { value: 'VVS1', label: 'VVS1' },
  { value: 'VVS2', label: 'VVS2' },
  { value: 'VS1', label: 'VS1' },
  { value: 'VS2', label: 'VS2' },
  { value: 'SI1', label: 'SI1' },
  { value: 'SI2', label: 'SI2' },
  { value: 'I1', label: 'I1' },
  { value: 'I2', label: 'I2' },
];

const GRADE_OPTIONS: Array<{ value: DiamondGrade; label: string }> = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const FLUORESCENCE_OPTIONS: Array<{ value: DiamondFluorescence; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'faint', label: 'Faint' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
  { value: 'very_strong', label: 'Very Strong' },
];

const CERTIFICATE_OPTIONS: Array<{ value: DiamondCertificate; label: string }> = [
  { value: 'GIA', label: 'GIA' },
  { value: 'IGI', label: 'IGI' },
  { value: 'HRD', label: 'HRD' },
  { value: 'GSI', label: 'GSI' },
  { value: 'SNJ', label: 'SNJ' },
];

const COLOR_GRADES = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

const AdminDiamonds = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [diamondCategories, setDiamondCategories] = useState<DiamondCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [diamondCategoryId, setDiamondCategoryId] = useState('');
  const [diamondType, setDiamondType] = useState<DiamondType>('real');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const [shape, setShape] = useState<DiamondShape | ''>('');
  const [carat, setCarat] = useState('');
  const [clarity, setClarity] = useState<DiamondClarity | ''>('');
  const [colorGrade, setColorGrade] = useState('');
  const [cut, setCut] = useState<DiamondGrade | ''>('');
  const [polish, setPolish] = useState<DiamondGrade | ''>('');
  const [symmetry, setSymmetry] = useState<DiamondGrade | ''>('');
  const [fluorescence, setFluorescence] = useState<DiamondFluorescence | ''>('');
  const [certificate, setCertificate] = useState<DiamondCertificate | ''>('');

  useEffect(() => {
    getDiamonds().then(setDiamonds);
    getDiamondCategories().then(setDiamondCategories);
  }, []);

  const refreshDiamonds = async () => {
    setDiamonds(await getDiamonds());
  };

  const getDescriptionPreview = (html: string) => {
    const text = stripHtml(html || '');
    if (!text) return '';
    return text.length > 140 ? `${text.slice(0, 137).trimEnd()}...` : text;
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const readers = files.map((file, index) => new Promise<MediaItem>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          id: `new-${Date.now()}-${index}`,
          url: reader.result as string,
          file,
          source: 'new',
        });
      };
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then((items) => {
      setMediaItems((previous) => [...previous, ...items]);
    });

    event.target.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((previous) => previous.filter((item) => item.id !== id));
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiamondCategoryId('');
    setDiamondType('real');
    setMediaItems([]);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
    setShape('');
    setCarat('');
    setClarity('');
    setColorGrade('');
    setCut('');
    setPolish('');
    setSymmetry('');
    setFluorescence('');
    setCertificate('');
  };

  const handleEdit = (diamond: Diamond) => {
    setEditingId(diamond.id);
    setName(diamond.name);
    setDescription(diamond.description || '');
    setPrice(diamond.price.replace(/[^0-9.]/g, ''));
    setDiamondCategoryId(diamond.diamondCategoryId);
    setDiamondType(diamond.diamondType);
    setMediaItems((diamond.images || [diamond.image]).map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      source: 'existing',
    })));
    setShape(diamond.shape || '');
    setCarat(diamond.carat !== undefined ? String(diamond.carat) : '');
    setClarity(diamond.clarity || '');
    setColorGrade(diamond.colorGrade || '');
    setCut(diamond.cut || '');
    setPolish(diamond.polish || '');
    setSymmetry(diamond.symmetry || '');
    setFluorescence(diamond.fluorescence || '');
    setCertificate(diamond.certificate || '');
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!name || !price || !diamondCategoryId || mediaItems.length === 0) {
      toast.error('Please fill all required fields and add at least one image');
      return;
    }

    setIsUploading(true);
    try {
      const uploads = await Promise.all(
        mediaItems
          .filter((item) => item.source === 'new' && item.file)
          .map((item) => uploadImageToStorage(item.file as File, 'diamonds'))
      );

      let uploadIndex = 0;
      const imageUrls = mediaItems.map((item) => {
        if (item.source === 'existing') return item.url;
        const url = uploads[uploadIndex];
        uploadIndex += 1;
        return url;
      });

      const existing = editingId ? diamonds.find((diamond) => diamond.id === editingId) : null;
      const payload: Diamond = {
        id: editingId || Date.now().toString(),
        name,
        description,
        price,
        diamondCategoryId,
        diamondType,
        image: imageUrls[0],
        images: imageUrls,
        createdAt: existing?.createdAt ?? Date.now(),
        ...(shape ? { shape } : {}),
        ...(carat ? { carat: parseFloat(carat) } : {}),
        ...(clarity ? { clarity } : {}),
        ...(colorGrade ? { colorGrade } : {}),
        ...(cut ? { cut } : {}),
        ...(polish ? { polish } : {}),
        ...(symmetry ? { symmetry } : {}),
        ...(fluorescence ? { fluorescence } : {}),
        ...(certificate ? { certificate } : {}),
      };

      await saveDiamond(payload);
      await refreshDiamonds();
      resetForm();
      setIsFormOpen(false);
      toast.success(editingId ? 'Diamond updated successfully' : 'Diamond added successfully');
    } catch (error) {
      console.error('Error saving diamond:', error);
      toast.error(editingId ? 'Failed to update diamond' : 'Failed to add diamond');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteDiamond(id);
      await refreshDiamonds();
      toast.success('Diamond deleted');
    } catch {
      toast.error('Failed to delete diamond');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Diamonds</h2>
          <p className="text-sm text-muted-foreground">Manage the public Diamond page items, types, and images.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Diamond
        </Button>
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsFormOpen(open);
        }}
      >
        <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Diamond' : 'Add New Diamond'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamond-category">Diamond Category *</Label>
                <Select value={diamondCategoryId} onValueChange={setDiamondCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diamond category" />
                  </SelectTrigger>
                  <SelectContent>
                    {diamondCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diamond-type">Diamond Type *</Label>
                <Select value={diamondType} onValueChange={(value) => setDiamondType(value as DiamondType)}>
                  <SelectTrigger id="diamond-type">
                    <SelectValue placeholder="Select diamond type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAMOND_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="diamond-name">Diamond Name *</Label>
              <Input
                id="diamond-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Oval Solitaire, Emerald Cut Pair"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="diamond-description">Description</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Enter diamond details with rich formatting."
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="diamond-price">Price (in $) *</Label>
              <Input
                id="diamond-price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g., 599.99"
                type="number"
                step="0.01"
              />
            </div>

            {/* Diamond Specifications */}
            <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
              <p className="text-sm font-semibold text-muted-foreground tracking-wide">Diamond Specifications <span className="font-normal">(optional — used for filters on Diamond page)</span></p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shape */}
                <div className="space-y-2">
                  <Label>Shape</Label>
                  <Select value={shape} onValueChange={(v) => setShape(v as DiamondShape)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHAPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Carat */}
                <div className="space-y-2">
                  <Label htmlFor="diamond-carat">Carat Weight</Label>
                  <Input
                    id="diamond-carat"
                    value={carat}
                    onChange={(e) => setCarat(e.target.value)}
                    placeholder="e.g., 1.25"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Clarity */}
                <div className="space-y-2">
                  <Label>Clarity</Label>
                  <Select value={clarity} onValueChange={(v) => setClarity(v as DiamondClarity)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clarity" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLARITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Grade */}
                <div className="space-y-2">
                  <Label>Color Grade</Label>
                  <Select value={colorGrade} onValueChange={setColorGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_GRADES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cut */}
                <div className="space-y-2">
                  <Label>Cut</Label>
                  <Select value={cut} onValueChange={(v) => setCut(v as DiamondGrade)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cut" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Polish */}
                <div className="space-y-2">
                  <Label>Polish</Label>
                  <Select value={polish} onValueChange={(v) => setPolish(v as DiamondGrade)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select polish" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symmetry */}
                <div className="space-y-2">
                  <Label>Symmetry</Label>
                  <Select value={symmetry} onValueChange={(v) => setSymmetry(v as DiamondGrade)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select symmetry" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fluorescence */}
                <div className="space-y-2">
                  <Label>Fluorescence</Label>
                  <Select value={fluorescence} onValueChange={(v) => setFluorescence(v as DiamondFluorescence)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fluorescence" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLUORESCENCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Certificate — full width */}
              <div className="space-y-2">
                <Label>Certificate</Label>
                <Select value={certificate} onValueChange={(v) => setCertificate(v as DiamondCertificate)}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select certificate" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="diamond-media">
                Diamond Images * ({mediaItems.length} file{mediaItems.length !== 1 ? 's' : ''})
              </Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => mediaInputRef.current?.click()} disabled={isUploading}>
                  <Images className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
                <span className="text-sm text-muted-foreground">
                  {mediaItems.length === 0 ? 'No files selected yet' : `${mediaItems.length} file${mediaItems.length !== 1 ? 's' : ''} ready`}
                </span>
              </div>
              <Input
                ref={mediaInputRef}
                id="diamond-media"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMediaUpload}
                disabled={isUploading}
              />

              {mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-3">
                  {mediaItems.map((media, index) => (
                    <div key={media.id} className="relative group">
                      <div className={`aspect-square rounded-lg border-2 overflow-hidden bg-muted ${media.source === 'new' ? 'border-primary' : 'border-border'}`}>
                        <img src={media.url} alt={`Diamond ${index + 1}`} className="w-full h-full object-cover" draggable={false} />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(media.id)}
                        className="absolute -top-2 -right-2 z-20 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        disabled={isUploading}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {index === 0 ? (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          Main
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { resetForm(); setIsFormOpen(false); }} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                <Plus className="h-4 w-4 mr-2" />
                {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Diamond' : 'Add Diamond')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Diamond Library</CardTitle>
        </CardHeader>
        <CardContent className="p-0" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diamonds.map((diamond) => {
          const categoryName = diamondCategories.find((category) => category.id === diamond.diamondCategoryId)?.name || 'Unknown';
          const typeLabel = DIAMOND_TYPE_OPTIONS.find((option) => option.value === diamond.diamondType)?.label || diamond.diamondType;

          const specTags = [
            diamond.shape ? SHAPE_OPTIONS.find(s => s.value === diamond.shape)?.label : null,
            diamond.carat ? `${diamond.carat} ct` : null,
            diamond.clarity ?? null,
            diamond.colorGrade ? `Color ${diamond.colorGrade}` : null,
            diamond.certificate ?? null,
          ].filter(Boolean) as string[];

          return (
            <Card key={diamond.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <img src={diamond.image} alt={diamond.name} className="w-full h-full object-cover" />
                {diamond.images && diamond.images.length > 1 ? (
                  <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    +{diamond.images.length - 1} more
                  </div>
                ) : null}
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{categoryName}</p>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {typeLabel}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{diamond.name}</h3>
                {diamond.description ? (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {getDescriptionPreview(diamond.description)}
                  </p>
                ) : null}
                {specTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {specTags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-bold text-xl text-primary mb-4">${formatPriceRounded(diamond.price)}</p>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(diamond)} disabled={isDeleting === diamond.id} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(diamond.id)} disabled={isDeleting === diamond.id} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === diamond.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {diamonds.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No diamonds added yet. Add your first diamond above.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default AdminDiamonds;
