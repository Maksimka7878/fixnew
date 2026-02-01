import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import { useAuthStore } from '@/store';
import { useAppBadge } from '@/hooks/useAppBadge';
import { broadcastService } from '@/services/broadcastService';
import { useState } from 'react';

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage').then(m => ({ default: m.CatalogPage })));
const CategoryPage = lazy(() => import('@/pages/catalog/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductPage = lazy(() => import('@/pages/catalog/ProductPage').then(m => ({ default: m.ProductPage })));
import { SplashScreen } from '@/components/ui/SplashScreen';
const SearchPage = lazy(() => import('@/pages/catalog/SearchPage').then(m => ({ default: m.SearchPage })));
const StoresPage = lazy(() => import('@/pages/public/StoresPage').then(m => ({ default: m.StoresPage })));
const PromotionsPage = lazy(() => import('@/pages/public/PromotionsPage').then(m => ({ default: m.PromotionsPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const OtpVerifyPage = lazy(() => import('@/pages/auth/OtpVerifyPage').then(m => ({ default: m.OtpVerifyPage })));
const CartPage = lazy(() => import('@/pages/cart/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/cart/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage').then(m => ({ default: m.ProfilePage })));
const LoyaltyPage = lazy(() => import('@/pages/account/LoyaltyPage').then(m => ({ default: m.LoyaltyPage })));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage').then(m => ({ default: m.OrdersPage })));
const FavoritesPage = lazy(() => import('@/pages/account/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading fallback
function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// Scroll to top on route change (replaces ScrollRestoration which requires data router)
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><PageTransition><HomePage /></PageTransition></Suspense>} />
          <Route path="catalog" element={<Suspense fallback={<PageLoader />}><PageTransition><CatalogPage /></PageTransition></Suspense>} />
          <Route path="catalog/:slug" element={<Suspense fallback={<PageLoader />}><PageTransition><CategoryPage /></PageTransition></Suspense>} />
          <Route path="product/:id" element={<Suspense fallback={<PageLoader />}><PageTransition><ProductPage /></PageTransition></Suspense>} />
          <Route path="search" element={<Suspense fallback={<PageLoader />}><PageTransition><SearchPage /></PageTransition></Suspense>} />
          <Route path="stores" element={<Suspense fallback={<PageLoader />}><PageTransition><StoresPage /></PageTransition></Suspense>} />
          <Route path="promotions" element={<Suspense fallback={<PageLoader />}><PageTransition><PromotionsPage /></PageTransition></Suspense>} />
          <Route path="cart" element={<Suspense fallback={<PageLoader />}><PageTransition><CartPage /></PageTransition></Suspense>} />
          <Route path="favorites" element={<Suspense fallback={<PageLoader />}><PageTransition><FavoritesPage /></PageTransition></Suspense>} />
          <Route path="checkout" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute></Suspense>} />
          <Route path="account" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute></Suspense>} />
          <Route path="account/loyalty" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><PageTransition><LoyaltyPage /></PageTransition></ProtectedRoute></Suspense>} />
          <Route path="account/orders" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><PageTransition><OrdersPage /></PageTransition></ProtectedRoute></Suspense>} />
        </Route>
        <Route path="/auth/login" element={<Suspense fallback={<PageLoader />}><PageTransition><LoginPage /></PageTransition></Suspense>} />
        <Route path="/auth/verify" element={<Suspense fallback={<PageLoader />}><PageTransition><OtpVerifyPage /></PageTransition></Suspense>} />
        <Route path="/admin/*" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageLoader />}><PageTransition><NotFoundPage /></PageTransition></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Update app badge with cart item count
  useAppBadge();

  // Initialize broadcast service for admin messages
  useEffect(() => {
    broadcastService.start();
    return () => {
      broadcastService.stop();
    };
  }, []);

  useEffect(() => {
    // Show splash for at least 2 seconds (like a real app launch)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <WebVitalsReporter />
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;

