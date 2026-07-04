import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { GalleryItem } from "@/lib/storage";

type Props = {
  items: GalleryItem[];
  autoplayMs?: number;
};

export default function GalleryCarousel({ items, autoplayMs = 4000 }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: items.length > 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || items.length <= 1 || autoplayMs <= 0 || isHovered) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, emblaApi, isHovered, items.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 md:gap-4">
          {items.map((item, i) => (
            <Link
              key={item.id}
              to="/gallery"
              className="relative overflow-hidden rounded-2xl md:rounded-3xl group block flex-[0_0_78%] sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
              style={{ aspectRatio: "4 / 5" }}
            >
              <OptimizedImage
                noWrapper
                src={item.image}
                alt={item.description || "Gallery"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                lqip={item.lqip}
                loading={i < 2 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
              />
              <div
                className="absolute inset-0 transition-opacity duration-400"
                style={{
                  background:
                    "linear-gradient(to top, rgba(6,3,1,0.82) 0%, rgba(6,3,1,0.15) 55%, transparent 85%)",
                }}
              />
              <div
                className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 0 1.5px rgba(196,144,106,0.6)",
                }}
              />
              {item.description && (
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <p className="text-white text-sm leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors z-10"
            style={{
              background: "rgba(6,3,1,0.55)",
              border: "1px solid rgba(196,144,106,0.35)",
              color: "#fff",
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors z-10"
            style={{
              background: "rgba(6,3,1,0.55)",
              border: "1px solid rgba(196,144,106,0.35)",
              color: "#fff",
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
