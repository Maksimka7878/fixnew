import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(!src);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)}>
        <Package className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      onError={() => setError(true)}
      className={cn(
        'w-full h-full object-cover transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
      decoding="async"
    />
  );
}
