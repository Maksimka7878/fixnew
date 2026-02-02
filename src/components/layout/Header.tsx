import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, Bookmark, User, Package, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAppStore, useUIStore } from '@/store';
import { usePreferredFrameRate } from '@/hooks/usePreferredFrameRate';
import { toast } from 'sonner';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { NotificationCenter } from '@/components/pwa/NotificationCenter';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { region } = useAppStore();
  const { setRegionModalOpen, setAuthModalOpen, setMobileMenuOpen, isMobileMenuOpen } = useUIStore();
  const { durationMultiplier, prefersReducedMotion } = usePreferredFrameRate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/50 shadow-soft pt-safe">
      {/* Smart App Banner (PWA) */}
      <PWAInstallPrompt />

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {/* Left: Burger Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Center: Delivery/Pickup Pill */}
          <button
            onClick={() => setRegionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span className="max-w-[140px] truncate">
              {region?.name || 'Доставка или самовывоз'}
            </span>
          </button>

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => navigate('/account/loyalty')}
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              key="mobile-search-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-white border-b relative z-40"
            >
              <div className="p-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-500"
                    onClick={() => setShowMobileSearch(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <Input
                    type="search"
                    placeholder="Поиск товаров..."
                    className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-brand/20 transition-all h-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" size="icon" className="bg-brand hover:bg-brand-600 text-white shrink-0 rounded-xl h-10 w-10">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Tags/Promotions */}
        <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-hide border-b">
          <Link
            to="/promotions"
            className="flex-shrink-0 px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-full"
          >
            Подарки любимым
          </Link>
          <span className="flex-shrink-0 text-sm text-gray-700">
            Распродажа! Всё по <strong>35 ₽</strong>
          </span>
        </div>
      </div>

      {/* Desktop Header (Refactored) */}
      <div className="hidden md:block border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-8">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">FP</span>
            </div>
            <span className="text-xl font-bold font-heading text-brand uppercase tracking-wide group-hover:text-brand-700 transition-colors">Fix Price</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="pl-12 w-full h-11 bg-gray-50 border-transparent focus:bg-white focus:border-brand/20 rounded-xl transition-all shadow-sm group-hover:shadow-md focus:shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')} title="Избранное" className="hover:text-brand hover:bg-brand/5">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Notification Bell (Off/On) - using simple disabled look for 'off' based on screenshot */}
            <Button variant="ghost" size="icon" title="Уведомления выключены" className="text-gray-400 hover:text-gray-600">
              <BellOff className="w-5 h-5" />
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" onClick={() => navigate('/account')} className="font-medium hover:text-brand hover:bg-brand/5">
                  <User className="w-5 h-5 mr-2" />
                  <span>{user?.firstName}</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setAuthModalOpen(true)} className="ml-2 font-medium hover:text-brand hover:bg-brand/5">
                <User className="w-5 h-5 mr-2" />
                <span>Войти</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.25 * durationMultiplier,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{ originY: 0 }}
            className="md:hidden overflow-hidden border-t bg-white"
          >
            <nav className="p-4 space-y-1">
              {[
                { to: '/catalog', label: 'Каталог товаров', bold: true },
                { to: '/stores', label: 'Магазины' },
                { to: '/promotions', label: 'Акции и скидки' },
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : i * 0.05 * durationMultiplier,
                    duration: prefersReducedMotion ? 0 : 0.2 * durationMultiplier
                  }}
                >
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 py-3 px-3 rounded-xl text-base hover:bg-gray-50 transition-colors ${item.bold ? 'font-medium' : ''
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated && (
                <>
                  <hr className="my-3" />
                  {[
                    { to: '/account', label: 'Профиль' },
                    { to: '/account/orders', label: 'Мои заказы' },
                    { to: '/account/loyalty', label: 'Бонусная карта' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: prefersReducedMotion ? 0 : (i + 3) * 0.05 * durationMultiplier,
                        duration: prefersReducedMotion ? 0 : 0.2 * durationMultiplier
                      }}
                    >
                      <Link
                        to={item.to}
                        className="flex items-center gap-3 py-3 px-3 rounded-xl text-base hover:bg-gray-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
