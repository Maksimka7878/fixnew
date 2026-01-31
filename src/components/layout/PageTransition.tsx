import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

// Cast to any to avoid strict type matching issues with framer-motion unions
const pageTransition: any = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3,
};

export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full flex-1"
        >
            {children}
        </motion.div>
    );
}
