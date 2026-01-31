import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '@/store/animation';

export function CartFlyAnimation() {
    const { isAnimating, startPos, imageUrl, endAnimation } = useAnimationStore();

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(endAnimation, 800); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isAnimating, endAnimation]);

    if (!isAnimating || !startPos || !imageUrl) return null;

    // Initial position is dynamic based on click
    // Target position is fixed (approximate location of cart icon)
    // Mobile bottom nav cart: ~50% width, bottom 20px
    // Desktop header cart: Top right area

    const isMobile = window.innerWidth < 768;
    const targetX = isMobile ? window.innerWidth / 2 : window.innerWidth - 100;
    const targetY = isMobile ? window.innerHeight - 40 : 40;

    return (
        <AnimatePresence>
            <motion.img
                src={imageUrl}
                initial={{
                    position: 'fixed',
                    zIndex: 9999,
                    left: startPos.x,
                    top: startPos.y,
                    width: 60,
                    height: 60,
                    opacity: 1,
                    scale: 1,
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}
                animate={{
                    left: targetX,
                    top: targetY,
                    scale: 0.2,
                    opacity: 0.5,
                }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0.35, 1.05] // Spring-like ease
                }}
                className="shadow-xl border-2 border-brand"
            />
        </AnimatePresence>
    );
}
