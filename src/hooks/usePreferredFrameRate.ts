import { useEffect, useState } from 'react';

/**
 * usePreferredFrameRate Hook
 *
 * Detects device refresh rate capability and user's motion preferences.
 * Allows animations to run at 120fps on capable devices, 60fps otherwise.
 *
 * @returns Object with animation duration multiplier and motion preference
 *
 * @example
 * const { isHighRefresh, prefersReducedMotion } = usePreferredFrameRate();
 *
 * // Use shorter durations on 120fps devices
 * const duration = isHighRefresh ? 0.3 : 0.5;
 * <motion.div animate={{}} transition={{ duration }} />
 */

interface FrameRateInfo {
  isHighRefresh: boolean;      // Device supports 120fps+ refresh rate
  prefersReducedMotion: boolean; // User prefers reduced motion
  durationMultiplier: number;    // 0.6 for 120fps, 1.0 for 60fps
}

export function usePreferredFrameRate(): FrameRateInfo {
  const [frameRateInfo, setFrameRateInfo] = useState<FrameRateInfo>({
    isHighRefresh: false,
    prefersReducedMotion: false,
    durationMultiplier: 1.0
  });

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Check for high refresh rate display
    let isHighRefresh = false;

    // Method 1: Check screen.refreshRate (if available)
    if ('screen' in window && 'refreshRate' in window.screen) {
      isHighRefresh = (window.screen as any).refreshRate > 60;
    }

    // Method 2: Fallback - detect via timing API
    if (!isHighRefresh && 'requestAnimationFrame' in window) {
      let frameCount = 0;
      let lastTime = performance.now();
      let frameRate = 60;

      const measureFrame = () => {
        frameCount++;
        const now = performance.now();
        const elapsed = now - lastTime;

        if (elapsed >= 1000) {
          frameRate = Math.round((frameCount * 1000) / elapsed);
          isHighRefresh = frameRate > 80; // Consider >80fps as high refresh
          frameCount = 0;
          lastTime = now;
        }

        // Only measure for a short time
        if (frameCount < 30) {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    }

    // Calculate duration multiplier
    // 120fps devices can use 60% shorter durations (1 frame at 120fps ≈ 0.6 frames at 60fps)
    const durationMultiplier = isHighRefresh ? 0.6 : 1.0;

    setFrameRateInfo({
      isHighRefresh: isHighRefresh && !prefersReducedMotion,
      prefersReducedMotion,
      durationMultiplier: prefersReducedMotion ? 0 : durationMultiplier // Disable animations if reduced motion
    });

    // Listen for motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setFrameRateInfo(prev => ({
        ...prev,
        prefersReducedMotion: e.matches,
        durationMultiplier: e.matches ? 0 : prev.durationMultiplier
      }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  return frameRateInfo;
}
