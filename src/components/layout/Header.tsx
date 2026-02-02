import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Menu, X, Heart, Bookmark, ChevronDown, LogOut, User, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useAuthStore, useAppStore, useUIStore } from '@/store';
import { usePreferredFrameRate } from '@/hooks/usePreferredFrameRate';
import { toast } from 'sonner';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { NotificationCenter } from '@/components/pwa/NotificationCenter';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из системы');
    navigate('/');
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

      {/* Desktop Header (original) */}
      <div className="hidden md:block">
        <div className="bg-brand text-white">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <button
              onClick={() => setRegionModalOpen(true)}
              className="flex items-center gap-1 hover:text-white/80 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{region?.name || 'Выберите регион'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-4">
              <Link to="/stores" className="hover:text-white/80 transition-colors">
                Магазины
              </Link>
              <Link to="/promotions" className="hover:text-white/80 transition-colors">
                Акции
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10">
                <OptimizedImage src="/logo.webp" alt="Fix Price" priority className="object-contain" />
              </div>
              <span className="text-xl font-bold font-heading text-brand uppercase tracking-wide">Fix Price</span>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Поиск товаров..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/account/loyalty')}>
                <Heart className="w-5 h-5" />
              </Button>

              <NotificationCenter />

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => navigate('/account')}>
                    <User className="w-5 h-5 mr-2" />
                    <span className="hidden lg:inline">{user?.firstName}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setAuthModalOpen(true)}>
                  <User className="w-5 h-5 mr-2" />
                  <span>Войти</span>
                </Button>
              )}
            </div>
          </div>

          <nav className="flex items-center gap-6 mt-3 pt-3 border-t">
            <Link to="/catalog" className="text-gray-700 hover:text-brand font-medium transition-colors">
              Каталог
            </Link>
            <Link to="/catalog/produkty" className="text-gray-600 hover:text-brand transition-colors">
              Продукты
            </Link>
            <Link to="/catalog/bytovaya-khimiya" className="text-gray-600 hover:text-brand transition-colors">
              Бытовая химия
            </Link>
            <Link to="/catalog/kosmetika" className="text-gray-600 hover:text-brand transition-colors">
              Косметика
            </Link>
          </nav>
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
