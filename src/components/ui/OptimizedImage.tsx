import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Convert image URL to WebP if the source supports it
function getOptimizedUrl(src: string): string {
  if (src.includes('placehold.co')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}format=webp`;
  }
  return src;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300 w-full h-full object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
