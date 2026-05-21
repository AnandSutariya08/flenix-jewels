import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Minus, RotateCcw, SlidersHorizontal } from 'lucide-react';
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
    value: 'all', label: 'All Shape',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="24,5 40,17 34,42 14,42 8,17"/>
        <line x1="24" y1="5" x2="14" y2="42"/><line x1="24" y1="5" x2="34" y2="42"/>
        <line x1="8" y1="17" x2="40" y2="17"/>
      </svg>
    ),
  },
  {
    value: 'round', label: 'Round',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <circle cx="24" cy="24" r="17"/>
        <ellipse cx="24" cy="24" rx="17" ry="8" strokeOpacity="0.3"/>
        <line x1="7" y1="24" x2="41" y2="24" strokeOpacity="0.3"/>
      </svg>
    ),
  },
  {
    value: 'pear', label: 'Pear',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <path d="M24,43 C12,35 7,26 7,18 C7,10 14,5 24,5 C34,5 41,10 41,18 C41,26 36,35 24,43Z"/>
        <line x1="24" y1="5" x2="24" y2="43" strokeOpacity="0.25"/>
        <line x1="10" y1="20" x2="38" y2="20" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'marquise', label: 'Marquise',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <path d="M4,24 C9,10 16,6 24,6 C32,6 39,10 44,24 C39,38 32,42 24,42 C16,42 9,38 4,24Z"/>
        <line x1="4" y1="24" x2="44" y2="24" strokeOpacity="0.25"/>
        <line x1="24" y1="6" x2="24" y2="42" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'oval', label: 'Oval',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <ellipse cx="24" cy="24" rx="18" ry="13"/>
        <ellipse cx="24" cy="24" rx="18" ry="5" strokeOpacity="0.25"/>
        <line x1="6" y1="24" x2="42" y2="24" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'heart', label: 'Heart',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <path d="M24,40 C24,40 6,28 6,17 C6,10 12,6 18,8 C21,9 23,12 24,15 C25,12 27,9 30,8 C36,6 42,10 42,17 C42,28 24,40 24,40Z"/>
        <line x1="24" y1="15" x2="24" y2="40" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'princess', label: 'Princess',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <rect x="8" y="8" width="32" height="32"/>
        <line x1="8" y1="8" x2="40" y2="40" strokeOpacity="0.25"/>
        <line x1="40" y1="8" x2="8" y2="40" strokeOpacity="0.25"/>
        <line x1="8" y1="24" x2="40" y2="24" strokeOpacity="0.25"/>
        <line x1="24" y1="8" x2="24" y2="40" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'cushion', label: 'Cushion',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <path d="M13,7 Q7,7 7,13 L7,35 Q7,41 13,41 L35,41 Q41,41 41,35 L41,13 Q41,7 35,7Z"/>
        <line x1="7" y1="24" x2="41" y2="24" strokeOpacity="0.25"/>
        <line x1="24" y1="7" x2="24" y2="41" strokeOpacity="0.25"/>
      </svg>
    ),
  },
  {
    value: 'emerald', label: 'Emerald',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="14,6 34,6 44,16 44,32 34,42 14,42 4,32 4,16"/>
        <polygon points="14,11 34,11 40,16 40,32 34,37 14,37 8,32 8,16" strokeOpacity="0.3"/>
      </svg>
    ),
  },
  {
    value: 'sq_emerald', label: 'Sq Emerald',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="13,5 35,5 43,13 43,35 35,43 13,43 5,35 5,13"/>
        <polygon points="13,11 35,11 37,13 37,35 35,37 13,37 11,35 11,13" strokeOpacity="0.3"/>
      </svg>
    ),
  },
  {
    value: 'radiant', label: 'Radiant',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="12,5 36,5 44,13 44,35 36,43 12,43 4,35 4,13"/>
        <polygon points="14,10 34,10 40,16 40,32 34,38 14,38 8,32 8,16" strokeOpacity="0.3"/>
      </svg>
    ),
  },
  {
    value: 'sq_radiant', label: 'Sq Radiant',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="11,5 37,5 43,11 43,37 37,43 11,43 5,37 5,11"/>
        <polygon points="13,10 35,10 38,13 38,35 35,38 13,38 10,35 10,13" strokeOpacity="0.3"/>
      </svg>
    ),
  },
  {
    value: 'other', label: 'Other',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="w-full h-full">
        <polygon points="24,5 38,12 44,27 37,41 11,41 4,27 10,12"/>
        <line x1="24" y1="5" x2="24" y2="41" strokeOpacity="0.25"/>
        <line x1="10" y1="20" x2="38" y2="20" strokeOpacity="0.25"/>
      </svg>
    ),
  },
];

const Chip = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'border transition-all duration-150 whitespace-nowrap font-semibold tracking-wide select-none px-2.5 py-1 rounded text-[11px]',
      active
        ? 'bg-amber-700 border-amber-700 text-white shadow-sm'
        : 'border-border/70 text-muted-foreground hover:border-amber-600/60 hover:text-foreground bg-background',
    )}
  >
    {label}
  </button>
);

const PresetChip = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'border transition-all duration-150 whitespace-nowrap font-semibold tracking-wide select-none px-2 py-0.5 rounded text-[10px]',
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
    'flex items-start gap-4 py-2.5',
    !noBorder && 'border-b border-border/40 last:border-0',
  )}>
    <div className="text-[9px] font-black tracking-[0.20em] uppercase text-muted-foreground w-24 flex-shrink-0 pt-1.5 leading-tight">
      {label}
    </div>
    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">{children}</div>
  </div>
);

export default function DiamondFilterPanel({
  filters, onChange, onToggle, onReset, diamondCategories,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
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

      {/* ── Header — entire row is clickable ─────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center px-5 py-3 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors duration-150"
      >
        {/* Left: icon + label + active badge */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] font-black tracking-[0.30em] uppercase text-foreground">
            Diamond Filters
          </span>
          {isActive && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-700 dark:text-amber-400 tracking-wide">
              Active
            </span>
          )}
        </div>

        {/* Right: reset + minimise + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isActive && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); handleReset(); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); handleReset(); } }}
              className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </span>
          )}
          {isOpen && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); setIsOpen(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setIsOpen(false); } }}
              className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors pl-2 border-l border-border/50"
            >
              <Minus className="h-3 w-3" />
              Minimise
            </span>
          )}
          <ChevronDown
            className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* ── Collapsible body ─────────────────────────────────── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '1200px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        {/* Shape grid — auto-fit wrap, no scroll arrows */}
        <div className="border-b bg-background/60 px-2 py-1">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(62px, 1fr))' }}>
            {SHAPES.map(s => {
              const active = filters.shape === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onChange('shape', s.value)}
                  className={cn(
                    'flex flex-col items-center justify-end gap-1.5 px-1 py-3 transition-all duration-150 border-b-2 relative select-none',
                    active
                      ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30',
                  )}
                >
                  <span className="w-8 h-8 flex items-center justify-center">
                    {s.icon}
                  </span>
                  <span className={cn(
                    'text-[7px] font-bold tracking-[0.10em] uppercase leading-none text-center',
                    active ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground',
                  )}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main filter rows — full width, no wasted space */}
        <div className="px-5 py-0">

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
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <Input
                  value={filters.caratMin}
                  onChange={e => { setActivePreset(null); onChange('caratMin', e.target.value); }}
                  placeholder="From"
                  type="number" step="0.01" min="0"
                  className="h-7 w-24 text-[11px] rounded px-2.5 shadow-none"
                />
                <span className="text-muted-foreground text-sm font-light">–</span>
                <Input
                  value={filters.caratMax}
                  onChange={e => { setActivePreset(null); onChange('caratMax', e.target.value); }}
                  placeholder="To"
                  type="number" step="0.01" min="0"
                  className="h-7 w-24 text-[11px] rounded px-2.5 shadow-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CARAT_PRESETS.map(p => (
                  <PresetChip
                    key={p.label}
                    label={p.label}
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

        {/* All remaining filters — single full-width column, no dead space */}
        <div className="border-t border-border/50 px-5 py-0">
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
          <FRow label="Fluorescence">
            {FLUORESCENCES.map(f => (
              <Chip key={f.value} label={f.label} active={filters.fluorescence.includes(f.value)} onClick={() => onToggle('fluorescence', f.value)} />
            ))}
          </FRow>
          <FRow label="Certificate">
            {CERTIFICATES.map(c => (
              <Chip key={c} label={c} active={filters.certificate.includes(c)} onClick={() => onToggle('certificate', c)} />
            ))}
          </FRow>
          {diamondCategories.length > 0 && (
            <FRow label="Category" noBorder>
              <Select value={filters.category} onValueChange={v => onChange('category', v)}>
                <SelectTrigger className="h-8 rounded border-border/70 shadow-none text-[11px] font-semibold w-52">
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
