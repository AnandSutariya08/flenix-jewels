import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  backgroundImage?: string;
  className?: string;
  contentClassName?: string;
};

export default function PageHero({
  title,
  subtitle,
  eyebrow,
  backgroundImage,
  className,
  contentClassName,
}: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-[#130900] dark:bg-[#0c0703]" aria-hidden="true" />
      )}

      {/* Brown/espresso overlay to keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(19,9,0,0.55) 0%, rgba(19,9,0,0.78) 55%, rgba(19,9,0,0.9) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 75% at 50% 35%, rgba(196,144,106,0.14) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.55) 35%, rgba(212,169,106,0.65) 50%, rgba(196,144,106,0.55) 65%, transparent 95%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-[360px] md:min-h-[460px] lg:min-h-[70vh] flex items-center justify-center px-4">
        <div className={cn("w-full max-w-4xl text-center", contentClassName)}>
          {eyebrow ? (
            <div className="mb-3 text-[10px] tracking-[0.38em] uppercase font-semibold text-[#C4906A]">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed text-white/65 max-w-2xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.22) 50%, transparent 95%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
