import { useState, useEffect } from 'react';
import { getInstagramPosts, saveInstagramPost, deleteInstagramPost, InstagramPost } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminInstagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [song, setSong] = useState('');
  const [caption, setCaption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getInstagramPosts().then(setPosts);
  }, []);

  const handleEdit = (post: InstagramPost) => {
    setEditingId(post.id);
    setUrl(post.url);
    setLocation(post.location ?? '');
    setSong(post.song ?? '');
    setCaption(post.caption ?? '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setUrl('');
    setLocation('');
    setSong('');
    setCaption('');
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleAddPost = async () => {
    if (!url) {
      toast.error('Please enter an Instagram post URL');
      return;
    }

    if (!url.includes('instagram.com')) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    setIsAdding(true);
    try {
      const postData: InstagramPost = {
        id: editingId || Date.now().toString(),
        url,
        location: location.trim() || undefined,
        song: song.trim() || undefined,
        caption: caption.trim() || undefined,
      };

      await saveInstagramPost(postData);
      const updated = await getInstagramPosts();
      setPosts(updated);
      resetForm();
      setIsFormOpen(false);
      toast.success(editingId ? 'Instagram post updated' : 'Instagram post added');
    } catch (error) {
      toast.error(editingId ? 'Failed to update post' : 'Failed to add post');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteInstagramPost(id);
      const updated = await getInstagramPosts();
      setPosts(updated);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Instagram</h2>
          <p className="text-sm text-muted-foreground">Add and manage Instagram post embeds.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Instagram Post
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(v) => { if (!v) resetForm(); setIsFormOpen(v); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Instagram Post' : 'Add Instagram Post'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram-url">Instagram Post URL *</Label>
              <Input
                id="instagram-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram-location">Location</Label>
                <Input
                  id="instagram-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, India"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-song">Song</Label>
                <Input
                  id="instagram-song"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="e.g. Artist — Track name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram-caption">Caption</Label>
              <Textarea
                id="instagram-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Paste the Instagram caption here…"
                className="min-h-[110px]"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancelEdit} variant="outline" disabled={isAdding}>
                Cancel
              </Button>
              <Button onClick={handleAddPost} disabled={isAdding}>
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Post' : 'Add Post')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  View Post <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mb-4 truncate">{post.url}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(post)}
                  disabled={isDeleting === post.id}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  disabled={isDeleting === post.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting === post.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminInstagram;
