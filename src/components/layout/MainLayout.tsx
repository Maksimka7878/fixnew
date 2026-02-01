import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { OfflineNotice } from '../pwa/OfflineNotice';
import { UpdatePrompt } from '../pwa/UpdatePrompt';

// Lazy load modals - they're only needed when user interacts with them
const CartDrawer = lazy(() => import('../cart/CartDrawer').then(m => ({ default: m.CartDrawer })));
const RegionModal = lazy(() => import('../modals/RegionModal').then(m => ({ default: m.RegionModal })));
const AuthModal = lazy(() => import('../modals/AuthModal').then(m => ({ default: m.AuthModal })));

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfflineNotice />
      <UpdatePrompt />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Footer: hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />

      {/* Lazy load modals - rendered only when needed */}
      <Suspense fallback={null}>
        <RegionModal />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
    </div>
  );
}
