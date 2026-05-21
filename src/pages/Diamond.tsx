import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PageHero from '@/components/PageHero';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
import EmptyState from '@/components/EmptyState';
import DiamondFilterPanel, {
  type DiamondFilters,
  DEFAULT_DIAMOND_FILTERS,
  hasActiveDiamondFilters,
} from '@/components/DiamondFilterPanel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { selectContentHydrated, selectContentStatus, selectGlobalData } from '@/store/contentSlice';
import { HEADER_OFFSET_PX } from '@/lib/layout';
import { buildOffer } from '@/lib/seo';
import { type Diamond } from '@/lib/storage';
import { Gem, Search } from 'lucide-react';
import diamondHero from '@/assets/diamond-hero.png';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

const getItemTime = (item: Diamond): number => {
  if (item.createdAt) {
    if (typeof item.createdAt === 'object' && item.createdAt !== null && 'seconds' in item.createdAt) {
      return (item.createdAt as { seconds: number }).seconds * 1000;
    }
    if (typeof item.createdAt === 'number') return item.createdAt;
    if (typeof item.createdAt === 'string') {
      const parsed = new Date(item.createdAt);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    }
  }
  return 0;
};

const DiamondPage = () => {
  const { diamondCategories, diamonds, promoHeader } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const isReady = status === 'succeeded' || hydrated;
  const paddingTop = HEADER_OFFSET_PX;
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<DiamondFilters>(DEFAULT_DIAMOND_FILTERS);
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const setFilter = <K extends keyof DiamondFilters>(key: K, value: DiamondFilters[K]) =>
    setFilters(f => ({ ...f, [key]: value }));

  const toggleFilter = (
    key: 'clarity' | 'color' | 'cut' | 'polish' | 'symmetry' | 'fluorescence' | 'certificate',
    val: string,
  ) => setFilters(f => ({ ...f, [key]: toggleArr(f[key] as string[], val) }));

  const filteredDiamonds = useMemo(() => {
    const f = filters;
    let items = diamonds;

    if (f.type !== 'all')        items = items.filter(d => d.diamondType === f.type);
    if (f.shape !== 'all')       items = items.filter(d => !d.shape || d.shape === f.shape);
    if (f.caratMin)              items = items.filter(d => d.carat === undefined || d.carat >= parseFloat(f.caratMin));
    if (f.caratMax)              items = items.filter(d => d.carat === undefined || d.carat <= parseFloat(f.caratMax));
    if (f.clarity.length)        items = items.filter(d => !d.clarity || f.clarity.includes(d.clarity));
    if (f.color.length)          items = items.filter(d => !d.colorGrade || f.color.includes(d.colorGrade));
    if (f.cut.length)            items = items.filter(d => !d.cut || f.cut.includes(d.cut));
    if (f.polish.length)         items = items.filter(d => !d.polish || f.polish.includes(d.polish));
    if (f.symmetry.length)       items = items.filter(d => !d.symmetry || f.symmetry.includes(d.symmetry));
    if (f.fluorescence.length)   items = items.filter(d => !d.fluorescence || f.fluorescence.includes(d.fluorescence));
    if (f.certificate.length)    items = items.filter(d => !d.certificate || f.certificate.includes(d.certificate));
    if (f.category !== 'all')    items = items.filter(d => d.diamondCategoryId === f.category);
    if (f.search) {
      const q = f.search.trim().toLowerCase();
      items = items.filter(d =>
        [d.name, d.description].filter(Boolean).join(' ').toLowerCase().includes(q),
      );
    }

    const sorted = [...items];
    if (f.sort === 'oldest') sorted.sort((a, b) => getItemTime(a) - getItemTime(b));
    else if (f.sort === 'a-z') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => getItemTime(b) - getItemTime(a));

    return sorted;
  }, [diamonds, filters]);

  // Sync ?type= URL param → filter (set by header Diamond dropdown: real / cvd)
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'real' || typeParam === 'cvd') {
      setFilters(f => ({ ...f, type: typeParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    const diamondId = searchParams.get('diamond');
    if (!diamondId) return;
    const match = diamonds.find((d) => d.id === diamondId);
    if (match) {
      setSelectedDiamond(match);
      setIsDialogOpen(true);
    }
  }, [diamonds, searchParams]);

  const handleDiamondClick = (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    setIsDialogOpen(true);
    setSearchParams({ diamond: diamond.id });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSearchParams({});
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.flenixjewels.com/diamond#collectionpage',
    name: 'Diamond Collection - Real & Lab Grown Diamonds | Flenix Jewels Ltd',
    description: 'Explore real diamonds and lab grown diamonds at Flenix Jewels Ltd. Filter by type, category, and discover curated diamond selections with premium imagery and expert support.',
    url: 'https://www.flenixjewels.com/diamond',
    mainEntityOfPage: 'https://www.flenixjewels.com/diamond',
    mainEntity: {
      '@type': 'ItemList',
      '@id': 'https://www.flenixjewels.com/diamond#itemlist',
      numberOfItems: filteredDiamonds.length,
      itemListElement: filteredDiamonds.slice(0, 24).map((diamond, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `https://www.flenixjewels.com/diamond?diamond=${diamond.id}#product`,
          name: diamond.name,
          image: diamond.images && diamond.images.length > 0 ? diamond.images : [diamond.image],
          description: diamond.description || `${diamond.name} from Flenix Jewels Ltd`,
          sku: diamond.id,
          category: diamondCategories.find((c) => c.id === diamond.diamondCategoryId)?.name || 'Diamond',
          brand: { '@type': 'Brand', name: 'Flenix Jewels Ltd' },
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Diamond Type', value: diamond.diamondType === 'real' ? 'Natural Diamond' : 'Lab Grown Diamond' },
          ],
          offers: buildOffer(`https://www.flenixjewels.com/diamond?diamond=${diamond.id}`, diamond.price),
        },
      })),
    },
  };

  const faqItems = [
    {
      question: 'Can I filter between natural diamonds and lab grown diamonds?',
      answer: 'Yes. The Diamond page lets you switch between natural diamonds, lab grown diamonds, or browse both together.',
    },
    {
      question: 'Can I search within the Diamond page?',
      answer: 'Yes. You can use the search bar to find diamonds by name or matching details.',
    },
    {
      question: 'Do diamond images follow the same media flow as the rest of the site?',
      answer: 'Yes. Diamond images are managed through admin and rendered using the same optimized image flow as other catalog sections.',
    },
  ];

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Loading Diamond Collection"
          description="Loading diamond collection details."
          canonicalUrl="https://www.flenixjewels.com/diamond"
        />
        <Header promoHeader={promoHeader} />
        <main className="flex-1 px-4 py-10" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-[280px] rounded-3xl bg-muted animate-pulse" />
            <div className="h-64 rounded-2xl bg-muted/70 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Diamond Collection - Real & Lab Grown Diamonds | Flenix Jewels Ltd"
        description="Browse premium real diamonds and lab grown diamonds at Flenix Jewels Ltd. Filter by type and category, search designs, and explore curated diamond selections."
        keywords="diamond page, real diamonds, lab grown diamonds, loose diamonds, diamond jewelry, flenix jewels diamonds"
        canonicalUrl="https://www.flenixjewels.com/diamond"
        structuredData={structuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.flenixjewels.com' },
          { name: 'Diamond', url: 'https://www.flenixjewels.com/diamond' },
        ]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>
        <PageHero
          backgroundImage={diamondHero}
          eyebrow={
            <span className="inline-flex items-center justify-center gap-2">
              <Gem className="h-3 w-3" />
              <span>Diamond Collection</span>
              <Gem className="h-3 w-3" />
            </span>
          }
          title={
            <>
              Find Your{' '}
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Perfect Diamond
              </span>
            </>
          }
          subtitle="Browse our curated collection of natural and lab grown diamonds — filter by shape, clarity, color, cut, and more."
        />

        <section className="px-3 sm:px-5 py-6 sm:py-8">
          <div className="max-w-[1600px] mx-auto space-y-4">

            {/* Professional filter panel */}
            <DiamondFilterPanel
              filters={filters}
              onChange={setFilter}
              onToggle={toggleFilter}
              onReset={() => setFilters(DEFAULT_DIAMOND_FILTERS)}
              diamondCategories={diamondCategories}
            />

            {/* Search + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={e => setFilter('search', e.target.value)}
                  placeholder="Search diamonds by name or details"
                  className="h-10 pl-10 rounded-xl border-2 shadow-none"
                />
              </div>
              <Select value={filters.sort} onValueChange={v => setFilter('sort', v)}>
                <SelectTrigger className="h-10 rounded-xl border-2 shadow-none sm:w-44">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="a-z">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{filteredDiamonds.length} result{filteredDiamonds.length !== 1 ? 's' : ''}</span>
                {hasActiveDiamondFilters(filters) && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_DIAMOND_FILTERS)}
                    className="text-amber-700 dark:text-amber-400 hover:underline text-xs font-semibold"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {diamonds.filter(d => d.diamondType === 'real').length} Natural · {diamonds.filter(d => d.diamondType === 'cvd').length} Lab Grown
              </div>
            </div>

            {/* Grid */}
            {filteredDiamonds.length === 0 ? (
              <EmptyState
                icon={<Gem className="h-7 w-7" />}
                title="No Diamonds Found"
                description="Try adjusting or clearing the filters above."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredDiamonds.map((diamond) => (
                  <ProductCard
                    key={diamond.id}
                    product={diamond}
                    onClick={() => handleDiamondClick(diamond)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <ProductDialog product={selectedDiamond} open={isDialogOpen} onOpenChange={handleDialogOpenChange} />
      <Footer />
    </div>
  );
};

export default DiamondPage;
