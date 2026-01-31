import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

// Convert image URL to WebP if supported and using a CDN that supports it
function getOptimizedUrl(src: string): string {
  // If it's a placehold.co URL, request WebP format
  if (src.includes('placehold.co')) {
    // placehold.co supports ?format=webp
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}format=webp`;
  }

  // For Fix Price CDN or other sources, check if they have WebP variants
  // Usually CDNs support adding .webp or ?format=webp
  if (src.includes('fix-price.com') || src.includes('fix-price.ru')) {
    // Try to use WebP if available
    if (!src.includes('.webp')) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
  }

  return src;
}

export function ProductImage({ src, alt, className = '', priority = false }: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  if (!src || error) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)}>
        <Package className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden bg-gray-100', className)}>
      {/* Placeholder blur */}
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
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // Fallback to original if WebP fails
            if (optimizedSrc !== src) {
              setError(false);
            } else {
              setError(true);
            }
          }}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
