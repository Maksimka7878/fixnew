import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useUIStore, useAuthStore } from '@/store';

const tabs = [
  { path: '/', label: 'Главная', icon: Home, showBadge: false },
  { path: '/catalog', label: 'Каталог', icon: LayoutGrid, showBadge: false },
  { path: '/cart', label: 'Корзина', icon: ShoppingCart, showBadge: true },
  { path: '/stores', label: 'Магазины', icon: MapPin, showBadge: false },
  { path: '/account', label: 'Профиль', icon: User, showBadge: false },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCartStore();
  const { setAuthModalOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const handleTabClick = (path: string) => {
    if (path === '/account' && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-md border border-gray-100/50 shadow-brand rounded-2xl pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className="relative flex flex-col items-center justify-center w-full h-full active:scale-95 transition-transform"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-12 h-1 bg-brand rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <tab.icon
                  className={`w-5 h-5 transition-colors ${active ? 'text-brand' : 'text-gray-400'
                    }`}
                />
                {/* Cart badge */}
                <AnimatePresence>
                  {tab.showBadge && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-2 -right-3 h-4 min-w-4 flex items-center justify-center bg-brand text-white text-[10px] font-bold rounded-full px-1"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${active ? 'text-brand' : 'text-gray-400'
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
