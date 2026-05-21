import { useState, useEffect } from 'react';
import { getTickerItems, saveTickerItems } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, Save, RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { loadGlobalData } from '@/store/contentSlice';

const DEFAULT_ITEMS = [
  'GIA Certified', 'IGI Graded', 'Worldwide Shipping', 'Lifetime Guarantee',
  '1K+ Happy Clients', '15+ Countries', 'Ethically Sourced', 'Custom Design',
];

const AdminTicker = () => {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newText, setNewText] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    getTickerItems().then((fetched) => {
      setItems(fetched);
      setLoading(false);
    });
  }, []);

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast.error('This item already exists');
      return;
    }
    setItems((prev) => [...prev, trimmed]);
    setNewText('');
  };

  const handleRemove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? value : item)));
  };

  const handleSave = async () => {
    const clean = items.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) {
      toast.error('Add at least one ticker item');
      return;
    }
    setSaving(true);
    try {
      await saveTickerItems(clean);
      dispatch(loadGlobalData({ force: true }));
      toast.success('Ticker items saved');
    } catch {
      toast.error('Failed to save ticker items');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setItems(DEFAULT_ITEMS);
    toast.info('Reset to defaults — click Save to apply');
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragEnter = (idx: number) => setDragOver(idx);
  const handleDragEnd = () => {
    if (dragIdx !== null && dragOver !== null && dragIdx !== dragOver) {
      const reordered = [...items];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(dragOver, 0, moved);
      setItems(reordered);
    }
    setDragIdx(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Ticker Bar</h2>
          <p className="text-sm text-muted-foreground">
            Manage the scrolling text shown at the bottom of the hero banner on the home page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {/* Preview strip */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(196,144,106,0.22)' }}>
        <p className="text-[9px] tracking-[0.25em] uppercase font-black px-4 pt-3 pb-1"
          style={{ color: 'rgba(196,144,106,0.7)' }}>Live Preview</p>
        <div className="overflow-hidden h-11 flex items-center px-4 gap-6">
          {(items.length ? items : DEFAULT_ITEMS).map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap">
              <span className="text-[9px] tracking-[0.32em] uppercase font-black"
                style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</span>
              <span style={{ color: 'rgba(196,144,106,0.55)', fontSize: 8 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Items list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse"
              style={{ background: 'rgba(196,144,106,0.08)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
              style={{
                background: dragOver === idx ? 'rgba(196,144,106,0.12)' : 'rgba(196,144,106,0.05)',
                border: dragOver === idx ? '1px solid rgba(196,144,106,0.4)' : '1px solid rgba(196,144,106,0.14)',
                cursor: 'grab',
                opacity: dragIdx === idx ? 0.4 : 1,
              }}
            >
              <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground cursor-grab" />
              <span className="text-[9px] tracking-[0.25em] uppercase font-black w-6 text-center"
                style={{ color: '#C4906A' }}>{idx + 1}</span>
              <Input
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-red-500"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="e.g. Free Engraving"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!newText.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag items to reorder. Changes are applied to the live site after you click Save.
      </p>
    </div>
  );
};

export default AdminTicker;
