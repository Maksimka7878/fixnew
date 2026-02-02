import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, Bookmark, User, Package, BellOff, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useAuthStore, useAppStore, useUIStore, useCartStore } from '@/store';
import { usePreferredFrameRate } from '@/hooks/usePreferredFrameRate';
import { useDebounce } from '@/hooks/useDebounce';
import { useMockCatalogApi } from '@/api/mock';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { NotificationCenter } from '@/components/pwa/NotificationCenter';
import type { Product } from '@/types';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { region } = useAppStore();
  const { setRegionModalOpen, setAuthModalOpen, setMobileMenuOpen, isMobileMenuOpen } = useUIStore();
  const { totalItems } = useCartStore();
  const { durationMultiplier, prefersReducedMotion } = usePreferredFrameRate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { getProducts } = useMockCatalogApi();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load all products for autocomplete
  useEffect(() => {
    getProducts({ regionId: region?.id || 'r1' }).then(res => {
      if (res.success && res.data) setAllProducts(res.data);
    });
  }, [getProducts, region?.id]);

  // Live autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) return [];
    const q = debouncedSearchQuery.toLowerCase();
    return allProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [debouncedSearchQuery, allProducts]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
      setShowSuggestions(false);
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
                    onClick={() => { setShowMobileSearch(false); setShowSuggestions(false); }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <Input
                    type="search"
                    placeholder="Поиск товаров..."
                    className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-brand/20 transition-all h-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    autoFocus
                  />
                  <Button type="submit" size="icon" className="bg-brand hover:bg-brand-600 text-white shrink-0 rounded-xl h-10 w-10">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
                {/* Mobile Autocomplete Suggestions */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 bg-white rounded-xl shadow-lg border overflow-hidden"
                    >
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            setShowSuggestions(false);
                            setShowMobileSearch(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images?.[0] && (
                              <OptimizedImage src={product.images[0].thumbnailUrl} alt={product.name} aspectRatio="1/1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-brand font-bold">{product.basePrice} ₽</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative group" ref={suggestionsRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="pl-12 w-full h-11 bg-gray-50 border-transparent focus:bg-white focus:border-brand/20 rounded-xl transition-all shadow-sm group-hover:shadow-md focus:shadow-lg"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {/* Autocomplete Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden"
                  >
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <OptimizedImage src={product.images[0].thumbnailUrl} alt={product.name} aspectRatio="1/1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-brand font-bold">{product.basePrice} ₽</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')} title="Избранное" className="hover:text-brand hover:bg-brand/5">
              <Heart className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" title="Уведомления выключены" className="text-gray-400 hover:text-gray-600">
              <BellOff className="w-5 h-5" />
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" onClick={() => navigate('/account')} className="font-medium hover:text-brand hover:bg-brand/5">
                <User className="w-5 h-5 mr-2" />
                <span>{user?.firstName}</span>
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setAuthModalOpen(true)} className="font-medium hover:text-brand hover:bg-brand/5">
                <User className="w-5 h-5 mr-2" />
                <span>Войти</span>
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} title="Корзина" className="hover:text-brand hover:bg-brand/5 relative">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="container mx-auto px-4 pb-0">
          <nav className="flex items-center gap-4 lg:gap-8 border-t py-3 overflow-x-auto scrollbar-hide">
            <Link to="/catalog" className="text-gray-800 hover:text-brand font-bold transition-colors whitespace-nowrap">
              Каталог
            </Link>
            {[
              { to: '/catalog/produkty', label: 'Продукты' },
              { to: '/catalog/bytovaya-khimiya', label: 'Бытовая химия' },
              { to: '/catalog/kosmetika', label: 'Косметика' },
              { to: '/catalog/dom-i-sad', label: 'Дом и сад' },
              { to: '/catalog/igrushki', label: 'Игрушки' },
              { to: '/catalog/tekstil', label: 'Текстиль' },
              { to: '/catalog/kantstovary', label: 'Канцтовары' },
              { to: '/catalog/podarki', label: 'Подарки' },
              { to: '/catalog/aktsii', label: 'Акции' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-600 hover:text-brand transition-colors whitespace-nowrap text-sm lg:text-base"
              >
                {item.label}
              </Link>
            ))}
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
