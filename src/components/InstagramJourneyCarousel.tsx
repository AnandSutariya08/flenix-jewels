import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Music2, Quote } from 'lucide-react';
import type { InstagramPost } from '@/lib/storage';

type Props = {
  posts: InstagramPost[];
  className?: string;
  autoplayMs?: number;
};

const getEmbedUrl = (url: string) => {
  const match = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
  if (!match) return null;
  return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
};

export default function InstagramJourneyCarousel({ posts, className, autoplayMs = 4200 }: Props) {
  const items = useMemo(() => posts.slice(0, 10), [posts]);
  const [isHovered, setIsHovered] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: false,
    loop: items.length > 1,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (items.length <= 1) return;
    if (autoplayMs <= 0) return;
    if (isHovered) return;

    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayMs);

    return () => window.clearInterval(id);
  }, [autoplayMs, emblaApi, isHovered, items.length]);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={emblaRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex gap-4 pb-2">
            {items.map((post) => (
              <JourneyCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border shadow-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function JourneyCard({ post }: { post: InstagramPost }) {
  const embed = getEmbedUrl(post.url);
  const [expanded, setExpanded] = useState(false);
  const caption = (post.caption ?? '').trim();
  const embedWrapRef = useRef<HTMLDivElement | null>(null);
  const [embedScale, setEmbedScale] = useState(1);

  // Instagram embeds are not responsive: they render at a fixed internal width.
  // To avoid the header/song line being cropped, we render at native width and scale down to fit the card.
  const IG_NATIVE_WIDTH = 612;
  const IG_NATIVE_HEIGHT = 760;

  useEffect(() => {
    const el = embedWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 0;
      if (!w) return;
      const next = Math.min(1, w / IG_NATIVE_WIDTH);
      setEmbedScale((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <article
      className="w-[84vw] max-w-[420px] shrink-0 overflow-hidden rounded-3xl bg-card"
      style={{ border: '1px solid rgba(196,144,106,0.16)' }}
    >
      {/* Top dynamic info area (song/location/caption) */}
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold text-xs tracking-[0.22em] uppercase transition-all duration-200 group"
            style={{ color: '#C4906A' }}
          >
            Open on Instagram
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        {(post.location || post.song || caption) && (
          <div className="mt-4 grid gap-3">
            {post.song && (
              <div className="flex items-start gap-2">
                <Music2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#C4906A' }} />
                <p className="text-sm leading-relaxed text-foreground break-words">{post.song}</p>
              </div>
            )}
            {post.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#C4906A' }} />
                <p className="text-sm leading-relaxed text-foreground break-words">{post.location}</p>
              </div>
            )}
            {caption && (
              <div className="flex items-start gap-2">
                <Quote className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#C4906A' }} />
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                    {expanded ? caption : `${caption.slice(0, 220)}${caption.length > 220 ? '…' : ''}`}
                  </p>
                  {caption.length > 220 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 text-xs font-bold tracking-[0.18em] uppercase"
                      style={{ color: '#C4906A' }}
                    >
                      {expanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle at 20% 10%, rgba(196,144,106,0.35) 0%, transparent 55%)' }}
        />
        <div ref={embedWrapRef} className="relative w-full overflow-hidden" style={{ height: Math.round(IG_NATIVE_HEIGHT * embedScale) }}>
          {embed ? (
            <iframe
              src={embed}
              className="bg-background"
              frameBorder="0"
              scrolling="no"
              loading="lazy"
              title={`Instagram post ${post.id}`}
              allow="encrypted-media; picture-in-picture; clipboard-write"
              style={{
                width: IG_NATIVE_WIDTH,
                height: IG_NATIVE_HEIGHT,
                transform: `scale(${embedScale})`,
                transformOrigin: 'top left',
                display: 'block',
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-sm text-muted-foreground">
              View Post
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
