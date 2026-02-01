import { motion } from 'framer-motion';
import { usePreferredFrameRate } from '@/hooks/usePreferredFrameRate';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ring' | 'dots' | 'pulse';
  message?: string;
}

const sizeMap = {
  sm: { container: 'w-6 h-6', stroke: 2 },
  md: { container: 'w-8 h-8', stroke: 2.5 },
  lg: { container: 'w-12 h-12', stroke: 3 }
};

/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with multiple variants.
 * Automatically adapts animation speed for 120fps devices.
 *
 * @example
 * <LoadingSpinner size="md" variant="ring" message="Loading..." />
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'ring',
  message
}: LoadingSpinnerProps) {
  const { durationMultiplier, prefersReducedMotion } = usePreferredFrameRate();
  const sizeConfig = sizeMap[size];

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`${sizeConfig.container} bg-gray-300 rounded-full animate-pulse`} />
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    );
  }

  // Adjust animation duration based on device refresh rate
  const duration = 2 * durationMultiplier;

  return (
    <div className="flex flex-col items-center gap-3">
      {variant === 'ring' && (
        <motion.svg
          className={`${sizeConfig.container} text-brand`}
          viewBox="0 0 24 24"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeDasharray="60"
            strokeDashoffset="0"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeDasharray="10"
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </motion.svg>
      )}

      {variant === 'dots' && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'} rounded-full bg-brand`}
              animate={{
                y: ['0px', '-8px', '0px']
              }}
              transition={{
                duration: 1 * durationMultiplier,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {variant === 'pulse' && (
        <motion.div
          className={`${sizeConfig.container} rounded-full border-2 border-brand`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 2 * durationMultiplier,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {message && (
        <motion.p
          className="text-sm text-gray-600"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2 * durationMultiplier,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
