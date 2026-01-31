import { useEffect } from 'react';
import { useCartStore } from '@/store';

/**
 * Hook to update the app badge with the cart item count.
 * Uses the Badging API (supported in Chrome, Edge, and some mobile browsers).
 */
export function useAppBadge() {
    const items = useCartStore((state) => state.items);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        if ('setAppBadge' in navigator) {
            if (totalItems > 0) {
                // Set the badge with the count
                (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> })
                    .setAppBadge(totalItems)
                    .catch((err) => console.warn('Badge API error:', err));
            } else {
                // Clear the badge
                (navigator as Navigator & { clearAppBadge: () => Promise<void> })
                    .clearAppBadge?.()
                    .catch((err) => console.warn('Badge API error:', err));
            }
        }
    }, [totalItems]);

    return totalItems;
}
