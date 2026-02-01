import { useEffect } from 'react';

/**
 * Web Vitals Reporter
 *
 * Monitors and reports Core Web Vitals:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * In development: logs to console
 * In production: can be sent to analytics service
 */

interface WebVitals {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const vitalsThresholds: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 600, poor: 1200 }
};

function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = vitalsThresholds[name];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function reportWebVital(vital: WebVitals) {
  const isDev = import.meta.env.DEV;
  const emoji = {
    good: '✅',
    'needs-improvement': '⚠️',
    poor: '❌'
  }[vital.rating];

  if (isDev) {
    // In development, log to console with color
    const style = {
      good: 'color: #10b981',
      'needs-improvement': 'color: #f59e0b',
      poor: 'color: #ef4444'
    }[vital.rating];

    console.log(
      `%c${emoji} ${vital.name}: ${vital.value.toFixed(2)}ms`,
      style
    );
  }

  // In production, send to analytics service
  if (!isDev && window.__ANALYTICS__) {
    window.__ANALYTICS__?.('web_vitals', {
      name: vital.name,
      value: vital.value,
      rating: vital.rating,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
}

export function WebVitalsReporter() {
  useEffect(() => {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            const value = lastEntry.renderTime || lastEntry.loadTime;
            reportWebVital({
              name: 'LCP',
              value,
              rating: getRating('LCP', value)
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.debug('LCP observer not supported');
      }

      // FID / INP (First Input Delay / Interaction to Next Paint)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVital({
              name: entry.name === 'first-input' ? 'FID' : 'INP',
              value: entry.processingDuration,
              rating: getRating(
                entry.name === 'first-input' ? 'FID' : 'INP',
                entry.processingDuration
              )
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input', 'event'] });
      } catch (e) {
        console.debug('FID/INP observer not supported');
      }

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              reportWebVital({
                name: 'CLS',
                value: clsValue,
                rating: getRating('CLS', clsValue)
              });
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.debug('CLS observer not supported');
      }

      // FCP (First Contentful Paint) - via PerformanceObserver
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            reportWebVital({
              name: 'FCP',
              value: entry.startTime,
              rating: getRating('FCP', entry.startTime)
            });
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.debug('FCP observer not supported');
      }
    }

    // TTFB (Time to First Byte) - via Navigation Timing API
    if ('PerformanceTiming' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart;
        reportWebVital({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb)
        });
      }
    }
  }, []);

  return null; // This component only reports metrics, doesn't render anything
}

// Declare global window interface for analytics
declare global {
  interface Window {
    __ANALYTICS__?: (event: string, data: any) => void;
  }
}
