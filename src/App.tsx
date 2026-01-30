// import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store';

// Lazy load pages
import { HomePage } from '@/pages/public/HomePage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CategoryPage } from '@/pages/catalog/CategoryPage';
import { ProductPage } from '@/pages/catalog/ProductPage';
import { SearchPage } from '@/pages/catalog/SearchPage';
import { StoresPage } from '@/pages/public/StoresPage';
import { PromotionsPage } from '@/pages/public/PromotionsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OtpVerifyPage } from '@/pages/auth/OtpVerifyPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/cart/CheckoutPage';
import { ProfilePage } from '@/pages/account/ProfilePage';
import { LoyaltyPage } from '@/pages/account/LoyaltyPage';
import { OrdersPage } from '@/pages/account/OrdersPage';
import { AdminPage } from '@/pages/admin/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalog/:slug" element={<CategoryPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="account" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
          <Route path="account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        </Route>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/verify" element={<OtpVerifyPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
