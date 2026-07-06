import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { GalleryItem } from "@/lib/storage";

type Props = {
  items: GalleryItem[];
  /** Seconds to complete one full loop. Lower = faster. Default 30s */
  durationS?: number;
};

export default function GalleryCarousel({ items, durationS = 30 }: Props) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  // Duplicate items enough times to fill the track seamlessly
  const duped = items.length < 6 ? [...items, ...items, ...items] : [...items, ...items];

  return (
    <div
      className="relative overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      /* hide overflow so items don't flash at the edges */
      style={{ maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
               WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)" }}
    >
      <div
        ref={trackRef}
        className="flex gap-3 md:gap-4"
        style={{
          width: "max-content",
          animation: `galleryScroll ${durationS}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {duped.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            to="/gallery"
            draggable={false}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl group block flex-shrink-0"
            style={{ width: "clamp(150px, 18vw, 220px)", aspectRatio: "4 / 5" }}
          >
            <OptimizedImage
              noWrapper
              src={item.image}
              alt={item.description || "Gallery"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              lqip={item.lqip}
              loading={i < 3 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(6,3,1,0.82) 0%, rgba(6,3,1,0.15) 55%, transparent 85%)",
              }}
            />
            {/* Gold border on hover */}
            <div
              className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 1.5px rgba(196,144,106,0.6)" }}
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

      {/* Keyframe injected inline so no global CSS file change needed */}
      <style>{`
        @keyframes galleryScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
