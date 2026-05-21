import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DiamondCategory } from '@/lib/storage';

export type DiamondFilters = {
  type: string;
  shape: string;
  caratMin: string;
  caratMax: string;
  clarity: string[];
  color: string[];
  cut: string[];
  polish: string[];
  symmetry: string[];
  fluorescence: string[];
  certificate: string[];
  search: string;
  category: string;
  sort: string;
};

export const DEFAULT_DIAMOND_FILTERS: DiamondFilters = {
  type: 'all', shape: 'all',
  caratMin: '', caratMax: '',
  clarity: [], color: [], cut: [], polish: [],
  symmetry: [], fluorescence: [], certificate: [],
  search: '', category: 'all', sort: 'newest',
};

export function hasActiveDiamondFilters(f: DiamondFilters): boolean {
  return f.type !== 'all' || f.shape !== 'all' || !!f.caratMin || !!f.caratMax ||
    !!f.clarity.length || !!f.color.length || !!f.cut.length || !!f.polish.length ||
    !!f.symmetry.length || !!f.fluorescence.length || !!f.certificate.length ||
    !!f.search || f.category !== 'all';
}

type Props = {
  filters: DiamondFilters;
  onChange: <K extends keyof DiamondFilters>(key: K, value: DiamondFilters[K]) => void;
  onToggle: (key: 'clarity' | 'color' | 'cut' | 'polish' | 'symmetry' | 'fluorescence' | 'certificate', val: string) => void;
  onReset: () => void;
  diamondCategories: DiamondCategory[];
};

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
const COLOR_GRADES = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const GRADES = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];
const FLUORESCENCES = [
  { value: 'none', label: 'None' },
  { value: 'faint', label: 'Faint' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
  { value: 'very_strong', label: 'Very Strong' },
];
const CERTIFICATES = ['GIA', 'IGI', 'HRD', 'GSI', 'SNJ'];

const CARAT_PRESETS = [
  { label: '0.18 - 0.22', min: '0.18', max: '0.22' },
  { label: '0.23 - 0.29', min: '0.23', max: '0.29' },
  { label: '0.30 - 0.39', min: '0.30', max: '0.39' },
  { label: '0.40 - 0.49', min: '0.40', max: '0.49' },
  { label: '0.50 - 0.69', min: '0.50', max: '0.69' },
  { label: '0.70 - 0.89', min: '0.70', max: '0.89' },
  { label: '0.90 - 0.99', min: '0.90', max: '0.99' },
  { label: '1.00 - 1.49', min: '1.00', max: '1.49' },
  { label: '1.50 - 1.99', min: '1.50', max: '1.99' },
  { label: '2.00 - 2.99', min: '2.00', max: '2.99' },
  { label: '3.00 - 3.99', min: '3.00', max: '3.99' },
  { label: '4+',          min: '4',    max: ''      },
];

const SHAPES: { value: string; label: string; icon: React.ReactNode }[] = [
  {
    value: 'all',
    label: 'All Shape',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="20,4 34,15 29,36 11,36 6,15"/>
      </svg>
    ),
  },
  {
    value: 'round',
    label: 'Round',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-full h-full">
        <circle cx="20" cy="20" r="14"/>
      </svg>
    ),
  },
  {
    value: 'pear',
    label: 'Pear',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <path d="M20,36 C10,29 6,21 6,15 C6,8 12,4 20,4 C28,4 34,8 34,15 C34,21 30,29 20,36Z"/>
      </svg>
    ),
  },
  {
    value: 'marquise',
    label: 'Marquise',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <path d="M4,20 C8,9 14,5 20,5 C26,5 32,9 36,20 C32,31 26,35 20,35 C14,35 8,31 4,20Z"/>
      </svg>
    ),
  },
  {
    value: 'oval',
    label: 'Oval',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-full h-full">
        <ellipse cx="20" cy="20" rx="15" ry="11"/>
      </svg>
    ),
  },
  {
    value: 'heart',
    label: 'Heart',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <path d="M20,33 C20,33 5,22 5,14 C5,8 10,5 15,6.5 C17,7.5 19,10 20,13 C21,10 23,7.5 25,6.5 C30,5 35,8 35,14 C35,22 20,33 20,33Z"/>
      </svg>
    ),
  },
  {
    value: 'princess',
    label: 'Princess',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <rect x="8" y="8" width="24" height="24"/>
      </svg>
    ),
  },
  {
    value: 'cushion',
    label: 'Cushion',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <path d="M11,7 Q7,7 7,11 L7,29 Q7,33 11,33 L29,33 Q33,33 33,29 L33,11 Q33,7 29,7Z"/>
      </svg>
    ),
  },
  {
    value: 'emerald',
    label: 'Emerald',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="12,5 28,5 37,13 37,27 28,35 12,35 3,27 3,13"/>
      </svg>
    ),
  },
  {
    value: 'sq_emerald',
    label: 'Sq Emerald',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="11,5 29,5 35,11 35,29 29,35 11,35 5,29 5,11"/>
      </svg>
    ),
  },
  {
    value: 'radiant',
    label: 'Radiant',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="10,4 30,4 38,12 38,28 30,36 10,36 2,28 2,12"/>
      </svg>
    ),
  },
  {
    value: 'sq_radiant',
    label: 'Sq Radiant',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="9,4 31,4 36,9 36,31 31,36 9,36 4,31 4,9"/>
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'Other',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-full h-full">
        <polygon points="20,4 32,10 36,23 29,35 11,35 4,23 8,10"/>
      </svg>
    ),
  },
];

const Chip = ({
  label, active, onClick, small = false,
}: { label: string; active: boolean; onClick: () => void; small?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'border transition-all duration-150 whitespace-nowrap font-semibold tracking-wide select-none',
      small
        ? 'px-2 py-0.5 rounded text-[10px]'
        : 'px-2.5 py-1 rounded text-[11px]',
      active
        ? 'bg-amber-700 border-amber-700 text-white shadow-sm'
        : 'border-border/70 text-muted-foreground hover:border-amber-600/60 hover:text-foreground bg-background',
    )}
  >
    {label}
  </button>
);

const FRow = ({
  label, children, noBorder = false,
}: { label: string; children: React.ReactNode; noBorder?: boolean }) => (
  <div className={cn(
    'flex items-start gap-0 py-2',
    !noBorder && 'border-b border-border/40 last:border-0',
  )}>
    <div className="text-[9px] font-black tracking-[0.20em] uppercase text-muted-foreground w-24 flex-shrink-0 pt-1.5 leading-tight">
      {label}
    </div>
    <div className="flex flex-wrap gap-1 flex-1 min-w-0">{children}</div>
  </div>
);

export default function DiamondFilterPanel({
  filters, onChange, onToggle, onReset, diamondCategories,
}: Props) {
  const [showAllColors, setShowAllColors] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const isActive = hasActiveDiamondFilters(filters);

  const handlePreset = (p: typeof CARAT_PRESETS[number]) => {
    if (activePreset === p.label) {
      setActivePreset(null);
      onChange('caratMin', '');
      onChange('caratMax', '');
    } else {
      setActivePreset(p.label);
      onChange('caratMin', p.min);
      onChange('caratMax', p.max);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    setShowAllColors(false);
    onReset();
  };

  const visibleColors = showAllColors ? COLOR_GRADES : COLOR_GRADES.slice(0, 14);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.28em] uppercase text-foreground">
            Diamond Filters
          </span>
          {isActive && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-600/20 text-amber-700 dark:text-amber-400 tracking-wide">
              Active
            </span>
          )}
        </div>
        {isActive && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </button>
        )}
      </div>

      {/* Shape icons row */}
      <div className="border-b overflow-x-auto bg-background/60">
        <div className="flex min-w-max">
          {SHAPES.map(s => {
            const active = filters.shape === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange('shape', s.value)}
                className={cn(
                  'flex flex-col items-center justify-end gap-1.5 px-3 py-3 min-w-[64px] transition-all duration-150 border-b-2 relative',
                  active
                    ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-900/20'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
                )}
              >
                <span className="w-7 h-7 flex items-center justify-center">
                  {s.icon}
                </span>
                <span className={cn(
                  'text-[8.5px] font-bold tracking-[0.12em] uppercase leading-none text-center',
                  active ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground',
                )}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main filter rows */}
      <div className="px-4 py-1">

        {/* Type */}
        <FRow label="Type">
          {[
            { value: 'all',  label: 'All Types' },
            { value: 'real', label: 'Natural' },
            { value: 'cvd',  label: 'Lab Grown' },
          ].map(o => (
            <Chip key={o.value} label={o.label} active={filters.type === o.value} onClick={() => onChange('type', o.value)} />
          ))}
        </FRow>

        {/* Carat */}
        <FRow label="Carat">
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-1.5">
              <Input
                value={filters.caratMin}
                onChange={e => { setActivePreset(null); onChange('caratMin', e.target.value); }}
                placeholder="From"
                type="number" step="0.01" min="0"
                className="h-6 w-20 text-[11px] rounded px-2 shadow-none"
              />
              <span className="text-muted-foreground text-xs">–</span>
              <Input
                value={filters.caratMax}
                onChange={e => { setActivePreset(null); onChange('caratMax', e.target.value); }}
                placeholder="To"
                type="number" step="0.01" min="0"
                className="h-6 w-20 text-[11px] rounded px-2 shadow-none"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {CARAT_PRESETS.map(p => (
                <Chip
                  key={p.label}
                  label={p.label}
                  small
                  active={activePreset === p.label}
                  onClick={() => handlePreset(p)}
                />
              ))}
            </div>
          </div>
        </FRow>

        {/* Clarity */}
        <FRow label="Clarity">
          {CLARITIES.map(c => (
            <Chip key={c} label={c} active={filters.clarity.includes(c)} onClick={() => onToggle('clarity', c)} />
          ))}
        </FRow>

        {/* Color */}
        <FRow label="Color" noBorder>
          {visibleColors.map(c => (
            <Chip key={c} label={c} active={filters.color.includes(c)} onClick={() => onToggle('color', c)} />
          ))}
          <button
            type="button"
            onClick={() => setShowAllColors(v => !v)}
            className="text-[9px] font-bold tracking-wide text-amber-700 dark:text-amber-400 hover:underline self-center px-1"
          >
            {showAllColors ? '▲ Less' : `▼ +${COLOR_GRADES.length - 14}`}
          </button>
        </FRow>
      </div>

      {/* Advanced 2-column section */}
      <div className="border-t border-border/60 grid grid-cols-1 md:grid-cols-2">

        {/* Left column */}
        <div className="px-4 py-1 md:border-r border-border/60">
          <FRow label="Cut">
            {GRADES.map(g => (
              <Chip key={g.value} label={g.label} active={filters.cut.includes(g.value)} onClick={() => onToggle('cut', g.value)} />
            ))}
          </FRow>
          <FRow label="Polish">
            {GRADES.map(g => (
              <Chip key={g.value} label={g.label} active={filters.polish.includes(g.value)} onClick={() => onToggle('polish', g.value)} />
            ))}
          </FRow>
          <FRow label="Symmetry">
            {GRADES.map(g => (
              <Chip key={g.value} label={g.label} active={filters.symmetry.includes(g.value)} onClick={() => onToggle('symmetry', g.value)} />
            ))}
          </FRow>
          <FRow label="Fluorescence" noBorder>
            {FLUORESCENCES.map(f => (
              <Chip key={f.value} label={f.label} active={filters.fluorescence.includes(f.value)} onClick={() => onToggle('fluorescence', f.value)} />
            ))}
          </FRow>
        </div>

        {/* Right column */}
        <div className="px-4 py-1 border-t md:border-t-0 border-border/60">
          <FRow label="Certificate">
            {CERTIFICATES.map(c => (
              <Chip key={c} label={c} active={filters.certificate.includes(c)} onClick={() => onToggle('certificate', c)} />
            ))}
          </FRow>
          {diamondCategories.length > 0 && (
            <FRow label="Category" noBorder>
              <Select value={filters.category} onValueChange={v => onChange('category', v)}>
                <SelectTrigger className="h-7 rounded border-border/70 shadow-none text-[11px] font-semibold w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {diamondCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FRow>
          )}
        </div>
      </div>
    </div>
  );
}
