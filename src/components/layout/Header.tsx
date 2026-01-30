import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, ShoppingCart, User, Menu, X, Heart, ChevronDown, LogOut, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore, useAppStore, useCartStore, useUIStore } from '@/store';
import { toast } from 'sonner';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { region } = useAppStore();
  const { totalItems } = useCartStore();
  const { setRegionModalOpen, setAuthModalOpen, setCartDrawerOpen, setMobileMenuOpen, isMobileMenuOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  const cartItemCount = totalItems;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden">
        {/* Top bar: hamburger | delivery pill | search + heart */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6 text-gray-800" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-6 h-6 text-gray-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Center: delivery / pickup pill */}
          <div className="flex bg-brand rounded-full p-0.5">
            <button
              onClick={() => setDeliveryMode('delivery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                deliveryMode === 'delivery'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              Доставка
            </button>
            <button
              onClick={() => setDeliveryMode('pickup')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                deliveryMode === 'pickup'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              Самовывоз
            </button>
          </div>

          {/* Right: search + heart */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/search')}
              className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => navigate('/account/loyalty')}
              className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100 transition-colors"
            >
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden border-t bg-white"
            >
              <nav className="px-4 py-4 space-y-1">
                {/* Region selector */}
                <button
                  onClick={() => { setRegionModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full py-3 px-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-brand" />
                  <span className="text-gray-800 font-medium">{region?.name || 'Выберите регион'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                </button>

                <hr className="my-2" />

                {[
                  { to: '/', label: 'Главная' },
                  { to: '/catalog', label: 'Каталог', bold: true },
                  { to: '/stores', label: 'Магазины' },
                  { to: '/promotions', label: 'Акции' },
                ].map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      to={item.to}
                      className={`block py-3 px-3 rounded-xl text-lg hover:bg-gray-50 transition-colors ${
                        item.bold ? 'font-semibold' : ''
                      } ${location.pathname === item.to ? 'text-brand bg-brand-50' : 'text-gray-800'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {isAuthenticated && (
                  <>
                    <hr className="my-2" />
                    {[
                      { to: '/account', label: 'Профиль' },
                      { to: '/account/orders', label: 'Мои заказы' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i + 4) * 0.05, duration: 0.2 }}
                      >
                        <Link
                          to={item.to}
                          className={`block py-3 px-3 rounded-xl text-lg hover:bg-gray-50 transition-colors ${
                            location.pathname === item.to ? 'text-brand' : 'text-gray-800'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.2 }}
                    >
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-2 w-full py-3 px-3 rounded-xl text-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Выйти
                      </button>
                    </motion.div>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <hr className="my-2" />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.2 }}
                    >
                      <button
                        onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                        className="flex items-center gap-2 w-full py-3 px-3 rounded-xl text-lg text-brand font-medium hover:bg-brand-50 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        Войти
                      </button>
                    </motion.div>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:block">
        {/* Top green bar */}
        <div className="bg-brand text-white">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <button onClick={() => setRegionModalOpen(true)} className="flex items-center gap-1 hover:text-brand-100 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>{region?.name || 'Выберите регион'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-4">
              <Link to="/stores" className="hover:text-brand-100 transition-colors">Магазины</Link>
              <Link to="/promotions" className="hover:text-brand-100 transition-colors">Акции</Link>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold text-brand">Fix Price</span>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type="search" placeholder="Поиск товаров..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/account/loyalty')}>
                <Heart className="w-5 h-5" />
              </Button>

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

              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartDrawerOpen(true)}>
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-brand text-white text-xs rounded-full"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          <nav className="flex items-center gap-6 mt-3 pt-3 border-t">
            <Link to="/catalog" className="text-gray-700 hover:text-brand font-medium transition-colors">Каталог</Link>
            <Link to="/catalog/produkty" className="text-gray-600 hover:text-brand transition-colors">Продукты</Link>
            <Link to="/catalog/bytovaya-khimiya" className="text-gray-600 hover:text-brand transition-colors">Бытовая химия</Link>
            <Link to="/catalog/kosmetika" className="text-gray-600 hover:text-brand transition-colors">Косметика</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
