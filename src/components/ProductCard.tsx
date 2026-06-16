import { useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { CatalogItem, type Diamond } from '@/lib/storage';
import WhatsAppButton from './WhatsAppButton';
import { Images, Play } from 'lucide-react';
import { keepImageAlive, keepVideoAlive } from '@/lib/preload';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { OptimizedVideo } from '@/components/ui/optimized-video';
import { stripHtml } from '@/lib/seo';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { formatPriceRounded } from "@/lib/utils";

function isDiamond(product: CatalogItem): product is Diamond {
  return 'diamondType' in product;
}

const SHAPE_LABEL: Record<string, string> = {
  round: 'Round', pear: 'Pear', marquise: 'Marquise', oval: 'Oval',
  heart: 'Heart', princess: 'Princess', cushion: 'Cushion', emerald: 'Emerald',
  sq_emerald: 'Sq Emerald', radiant: 'Radiant', sq_radiant: 'Sq Radiant', other: 'Other',
};

interface ProductCardProps {
  product: CatalogItem;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { priceSettings } = useAppSelector(selectGlobalData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const mediaRaw = product.images && product.images.length > 0 ? product.images : [product.image];
  const media = mediaRaw.filter(Boolean);
  const hasMultiple = media.length > 1;

  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const primaryMedia = media[0];
  const secondaryMedia = media[1] || null;
  const displayMedia = media[currentIndex] || primaryMedia;

  const descriptionPreview = useMemo(() => {
    const text = stripHtml(product.description || '');
    if (!text) return '';
    return text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
  }, [product.description]);

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes('video') ? 'video' : 'image';
  };

  const currentMediaType = getMediaType(displayMedia);
  const isSecondaryImage = secondaryMedia ? getMediaType(secondaryMedia) === 'image' : false;

  useEffect(() => {
    setCurrentIndex(0);
    setIsHovered(false);
  }, [product.id]);

  // Preload any video files in the background as soon as the card renders
  useEffect(() => {
    media.forEach(url => {
      if (getMediaType(url) === 'video') keepVideoAlive(url);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isCoarsePointer) return;
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isCoarsePointer || touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    if (Math.abs(deltaX) >= 30 && hasMultiple) {
      setCurrentIndex(prev =>
        deltaX < 0 ? (prev + 1) % media.length : (prev - 1 + media.length) % media.length
      );
    }
    touchStartX.current = null;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Upgrade priority on hover — user is about to click, load fast
    [primaryMedia, secondaryMedia].filter(Boolean).forEach(url => keepImageAlive(url as string, "high"));
    if (secondaryMedia && /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(secondaryMedia)) {
      keepVideoAlive(secondaryMedia);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentMediaType === 'video' ? (
          <div className="relative w-full h-full">
            <OptimizedVideo
              noWrapper
              src={displayMedia}
              className="w-full h-full object-cover"
              autoPlay={isHovered}
              preload="none"
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
              <div className="bg-white/95 dark:bg-zinc-800/95 rounded-full p-3 shadow-lg">
                <Play className="h-6 w-6 text-zinc-700 dark:text-zinc-300" fill="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Primary image */}
            <div className="absolute inset-0">
              <OptimizedImage
                noWrapper
                src={primaryMedia}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                draggable={false}
              />
            </div>
          </>
        )}

        {/* Media Count Badge */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-border/50">
            <Images className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">{media.length}</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 lg:p-6">
        <h3 className="font-semibold text-base sm:text-lg lg:text-xl mb-2 line-clamp-2 min-h-[3rem] text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Diamond spec badges */}
        {isDiamond(product) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.diamondType && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${product.diamondType === 'cvd' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'}`}>
                {product.diamondType === 'cvd' ? 'Lab Grown' : 'Natural'}
              </span>
            )}
            {product.shape && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-muted border border-border text-muted-foreground">
                {SHAPE_LABEL[product.shape] ?? product.shape}
              </span>
            )}
            {product.carat !== undefined && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-muted border border-border text-muted-foreground">
                {product.carat}ct
              </span>
            )}
            {product.clarity && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-muted border border-border text-muted-foreground">
                {product.clarity}
              </span>
            )}
            {product.colorGrade && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-muted border border-border text-muted-foreground">
                {product.colorGrade} Colour
              </span>
            )}
            {product.cut && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-muted border border-border text-muted-foreground capitalize">
                {product.cut.replace('_', ' ')} Cut
              </span>
            )}
            {product.certificate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-stone-100 text-stone-700 border border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600">
                {product.certificate}
              </span>
            )}
          </div>
        )}

        {priceSettings.showPrices && (
          <div className="mb-3 text-sm font-semibold tracking-wide text-foreground/90">
            ${formatPriceRounded(product.price)}
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-3 flex-1 leading-6">
          {descriptionPreview}
        </p>

        <div className="space-y-4 mt-auto">
          <div onClick={(e) => e.stopPropagation()}>
            <WhatsAppButton product={product} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
