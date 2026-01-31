import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { CartDrawer } from '../cart/CartDrawer';
import { RegionModal } from '../modals/RegionModal';
import { AuthModal } from '../modals/AuthModal';
import { InstallPrompt } from '../pwa/InstallPrompt';
import { OfflineNotice } from '../pwa/OfflineNotice';
import { UpdatePrompt } from '../pwa/UpdatePrompt';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfflineNotice />
      <UpdatePrompt />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
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
      <RegionModal />
      <AuthModal />
      <CartDrawer />
      <InstallPrompt />
    </div>
  );
}
