import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ProductCard from '@/components/ProductCard';
import ProductDialog from '@/components/ProductDialog';
import EmptyState from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { selectContentHydrated, selectContentStatus, selectGlobalData } from '@/store/contentSlice';
import { HEADER_OFFSET_PX } from '@/lib/layout';
import { buildOffer } from '@/lib/seo';
import { type Diamond, type DiamondType } from '@/lib/storage';
import { Gem, Search, SlidersHorizontal } from 'lucide-react';
import diamondHero from '@/assets/diamond-hero.png';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

const TYPE_LABELS: Record<'all' | DiamondType, string> = {
  all: 'All Diamonds',
  real: 'Real Diamonds',
  cvd: 'CVD Diamonds',
};

const getItemTime = (item: Diamond): number => {
  if (item.createdAt) {
    if (typeof item.createdAt === 'object' && item.createdAt !== null && 'seconds' in item.createdAt) {
      return item.createdAt.seconds * 1000;
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
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | DiamondType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z'>('newest');
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDiamonds = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const items = diamonds.filter((diamond) => {
      const matchesType = selectedType === 'all' ? true : diamond.diamondType === selectedType;
      const matchesCategory = selectedCategory === 'all' ? true : diamond.diamondCategoryId === selectedCategory;
      const matchesSearch = normalizedSearch.length === 0
        ? true
        : [diamond.name, diamond.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesType && matchesCategory && matchesSearch;
    });

    const sorted = [...items];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => getItemTime(a) - getItemTime(b));
    } else if (sortBy === 'a-z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => getItemTime(b) - getItemTime(a));
    }

    return sorted;
  }, [diamonds, search, selectedCategory, selectedType, sortBy]);

  useEffect(() => {
    const diamondId = searchParams.get('diamond');
    if (!diamondId) return;
    const match = diamonds.find((diamond) => diamond.id === diamondId);
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
    if (!open) {
      setSearchParams({});
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.flenixjewels.com/diamond#collectionpage',
    name: 'Diamond Collection - Real & CVD Diamonds | Flenix Jewels',
    description: 'Explore real diamonds and CVD diamonds at Flenix Jewels. Filter by type, category, and discover curated diamond selections with premium imagery and expert support.',
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
          description: diamond.description || `${diamond.name} from Flenix Jewels`,
          sku: diamond.id,
          category: diamondCategories.find((category) => category.id === diamond.diamondCategoryId)?.name || 'Diamond',
          brand: {
            '@type': 'Brand',
            name: 'Flenix Jewels',
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Diamond Type',
              value: TYPE_LABELS[diamond.diamondType],
            },
          ],
          offers: buildOffer(`https://www.flenixjewels.com/diamond?diamond=${diamond.id}`, diamond.price),
        },
      })),
    },
  };

  const faqItems = [
    {
      question: 'Can I filter between real diamonds and CVD diamonds?',
      answer: 'Yes. The Diamond page lets you switch between real diamonds, CVD diamonds, or browse both together.',
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
            <div className="h-24 rounded-2xl bg-muted/70 animate-pulse" />
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
        title="Diamond Collection - Real & CVD Diamonds | Flenix Jewels"
        description="Browse premium real diamonds and CVD diamonds at Flenix Jewels. Filter by type and category, search designs, and explore curated diamond selections."
        keywords="diamond page, real diamonds, cvd diamonds, loose diamonds, diamond jewelry, flenix jewels diamonds"
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
        <section className="px-3 sm:px-5 pt-4 sm:pt-6">
          <div className="max-w-[1600px] mx-auto overflow-hidden rounded-[32px] border border-[rgba(196,144,106,0.18)] shadow-[0_18px_60px_-20px_rgba(0,0,0,0.25)] bg-white">
            <img
              src={diamondHero}
              alt="Choose your brilliance - real diamonds and CVD diamonds"
              className="w-full h-auto block"
              loading="eager"
              decoding="async"
            />
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-10 py-8 md:py-10">
          <div className="max-w-[1500px] mx-auto space-y-8">
            <div className="rounded-3xl border bg-card/70 backdrop-blur-sm p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="max-w-3xl">
                  <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3 text-primary">Diamond Collection</p>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.06]">
                    Find Your
                    <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginLeft: 10 }}>
                      Perfect Diamond
                    </span>
                  </h1>
                  <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Explore admin-managed real diamonds and CVD diamonds in one refined catalog. Search by name, filter by type and category, and open any piece for a closer look.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[360px]">
                  <div className="rounded-2xl border bg-background/80 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{diamonds.length}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">Total Diamonds</div>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{diamonds.filter((item) => item.diamondType === 'real').length}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">Real</div>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{diamonds.filter((item) => item.diamondType === 'cvd').length}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">CVD</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card/70 backdrop-blur-sm p-5 md:p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_220px_220px_220px] gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search diamonds by name or details"
                    className="h-12 pl-11 rounded-2xl border-2 shadow-none"
                  />
                </div>

                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'all' | DiamondType)}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 shadow-none">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="real">Real Diamonds</SelectItem>
                    <SelectItem value="cvd">CVD Diamonds</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 shadow-none">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {diamondCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'a-z')}>
                  <SelectTrigger className="h-12 rounded-2xl border-2 shadow-none">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="a-z">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* <div className="flex items-center gap-2 flex-wrap">
                  {(['all', 'real', 'cvd'] as Array<'all' | DiamondType>).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={selectedType === type ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => setSelectedType(type)}
                    >
                      {TYPE_LABELS[type]}
                    </Button>
                  ))}
                </div> */}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{filteredDiamonds.length} result{filteredDiamonds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              {/* 
              {diamondCategories.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <Button
                    type="button"
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="rounded-full flex-shrink-0"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Categories
                  </Button>
                  {diamondCategories.map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="rounded-full flex-shrink-0"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              ) : null} */}
            </div>

            {filteredDiamonds.length === 0 ? (
              <EmptyState
                icon={<Gem className="h-7 w-7" />}
                title="No Diamonds Found"
                description="Try adjusting the search term, diamond type, or category filter."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDiamonds.map((diamond) => (
                  <ProductCard
                    key={diamond.id}
                    product={diamond}
                    onClick={() => handleDiamondClick(diamond)}
                  />
                ))}
              </div>
            )}

            {/* {diamondCategories.length > 0 ? (
              <section className="pt-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Browse by Diamond Category</h2>
                    <p className="text-sm text-muted-foreground mt-1">Quick filters powered by your admin-managed diamond categories.</p>
                  </div>
                  <Link to="/contact">
                    <Button variant="outline" className="rounded-full">Need Help Choosing?</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {diamondCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className="group text-left rounded-3xl overflow-hidden border bg-card hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-muted">
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-4">
                        <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-bold mb-2">Category</div>
                        <div className="font-semibold leading-snug">{category.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null} */}
          </div>
        </section>
      </main>

      <ProductDialog product={selectedDiamond} open={isDialogOpen} onOpenChange={handleDialogOpenChange} />
      <Footer />
    </div>
  );
};

export default DiamondPage;
