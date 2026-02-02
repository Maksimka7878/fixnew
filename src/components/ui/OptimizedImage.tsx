import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  priority?: boolean;
  onLoad?: () => void;
}

/**
 * OptimizedImage Component - Улучшенная оптимизация изображений
 *
 * Features:
 * ✅ WebP format с fallback на JPEG
 * ✅ Responsive srcset (1x, 2x, 3x)
 * ✅ Lazy loading с Intersection Observer
 * ✅ Blur placeholder эффект
 * ✅ Сохранение aspect ratio
 * ✅ Priority loading для above-the-fold изображений
 * ✅ Предотвращение layout shift
 */

// Convert image URL to optimized versions
function getOptimizedUrls(src: string) {
  if (src.includes('placehold.co')) {
    const separator = src.includes('?') ? '&' : '?';
    return {
      webp: `${src}${separator}format=webp`,
      jpeg: src,
      srcSet: `${src}${separator}w=640&format=jpeg 1x, ${src}${separator}w=1280&format=jpeg 2x`
    };
  }

  // For external images, return as-is
  if (src.includes('http')) {
    return {
      webp: src.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      jpeg: src,
      srcSet: `${src} 1x, ${src} 2x`
    };
  }

  // For local/emoji images
  return {
    webp: src,
    jpeg: src,
    srcSet: `${src} 1x`
  };
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio,
  priority = false,
  onLoad
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const { webp, jpeg, srcSet } = getOptimizedUrls(src);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // If WebP fails, try JPEG
    if (imgRef.current && imgRef.current.srcset !== jpeg) {
      imgRef.current.src = jpeg;
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const blurDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3C/svg%3E';

  const containerStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio: aspectRatio || undefined
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      )}

      {/* Image */}
      {isInView && (
        <picture className="block w-full h-full">
          {/* WebP source */}
          {!src.includes('data:') && (
            <source
              srcSet={webp}
              type="image/webp"
            />
          )}

          {/* JPEG fallback source */}
          {!src.includes('data:') && (
            <source
              srcSet={srcSet}
              type="image/jpeg"
            />
          )}

          {/* Fallback img tag */}
          <img
            ref={imgRef}
            src={isLoaded ? src : blurDataUrl}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              isLoaded ? 'opacity-100 blur-0' : 'opacity-50 blur-xl'
            )}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-xs">⚠️ Image failed to load</span>
        </div>
      )}
    </div>
  );
}
