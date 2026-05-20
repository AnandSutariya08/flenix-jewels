import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  noWrapper?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
  noWrapper,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const skeleton = !loaded ? (
    <div
      className={cn(
        'absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse',
        skeletonClassName
      )}
    />
  ) : null;

  const img = (
    <img
      src={src}
      alt={alt}
      className={cn(
        'transition-opacity duration-700',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      {...props}
    />
  );

  if (noWrapper) {
    return (
      <>
        {skeleton}
        {img}
      </>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {skeleton}
      {img}
    </div>
  );
}
