import { motion } from 'framer-motion';

interface ProductCardSkeletonProps {
  count?: number;
  delay?: number;
}

/**
 * ProductCardSkeleton Component
 *
 * Shimmer-based skeleton loader for product cards.
 * Much better UX than generic pulse loaders.
 */
export function ProductCardSkeleton({ count = 1, delay = 0 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + idx * 0.05 }}
          className="h-full flex flex-col overflow-hidden rounded-2xl border-0 shadow-soft bg-white/50 backdrop-blur-sm"
        >
          {/* Image Skeleton with Shimmer */}
          <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]">
            <motion.div
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{
                backgroundSize: '200% 100%'
              }}
            />
          </div>

          {/* Content Skeleton */}
          <div className="p-4 flex-1 flex flex-col space-y-3">
            {/* Title lines */}
            <div className="space-y-2">
              <motion.div
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
                style={{ backgroundSize: '200% 100%' }}
              />
              <motion.div
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.1 }}
                className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>

            <div className="flex-grow" />

            {/* Price line */}
            <motion.div
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.2 }}
              className="h-6 w-1/2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Button Skeleton */}
          <div className="p-4 pt-0">
            <motion.div
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.3 }}
              className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        </motion.div>
      ))}
    </>
  );
}
