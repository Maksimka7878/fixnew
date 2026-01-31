import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Region, User, AuthTokens,
  Cart, CartItem, Category, Product, ProductRegionData,
  Order, Promotion, Banner,
  LoyaltyCard, LoyaltyPoints, BonusTransaction, ReferralProgram,
  PaymentCard, NotificationSettings
} from '@/types';

// ============================================================================
// SIMPLE CART ITEM TYPE FOR UI
// ============================================================================
interface SimpleCartItem {
  product: Product;
  quantity: number;
}

interface SimpleCartStore {
  items: SimpleCartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number, maxAvailable?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, maxAvailable?: number) => void;
  clearCart: () => void;
  getMaxQuantityForProduct: (productId: string) => number;
}

// ============================================================================
// APP STORE
// ============================================================================
interface AppStore {
  region: Region | null;
  isRegionLoading: boolean;
  isOnline: boolean;
  setRegion: (region: Region | null) => void;
  setRegionLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  region: null,
  isRegionLoading: false,
  isOnline: navigator.onLine,
  setRegion: (region) => set({ region }),
  setRegionLoading: (isRegionLoading) => set({ isRegionLoading }),
  setOnline: (isOnline) => set({ isOnline }),
}));

// ============================================================================
// AUTH STORE
// ============================================================================
interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

// ============================================================================
// CATALOG STORE
// ============================================================================
interface CatalogStore {
  categories: Category[];
  products: Product[];
  productRegionData: Map<string, ProductRegionData>;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setProductRegionData: (data: ProductRegionData[]) => void;
  getProductRegionData: (productId: string, regionId: string) => ProductRegionData | undefined;
  getRootCategories: () => Category[];
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  categories: [],
  products: [],
  productRegionData: new Map(),
  setCategories: (categories) => set({ categories }),
  setProducts: (products) => set({ products }),
  setProductRegionData: (data) => {
    const newMap = new Map(get().productRegionData);
    data.forEach((item) => newMap.set(`${item.productId}:${item.regionId}`, item));
    set({ productRegionData: newMap });
  },
  getProductRegionData: (productId, regionId) => get().productRegionData.get(`${productId}:${regionId}`),
  getRootCategories: () => get().categories.filter((c) => !c.parentId && c.isActive),
}));

// ============================================================================
// SIMPLE CART STORE (For UI pages)
// ============================================================================
export const useCartStore = create<SimpleCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      addItem: (product, quantity = 1, maxAvailable = Infinity) => {
        const items = [...get().items];
        const existing = items.find(item => item.product.id === product.id);
        const quantityToAdd = Math.min(quantity, maxAvailable - (existing?.quantity || 0));

        if (quantityToAdd > 0) {
          if (existing) {
            existing.quantity += quantityToAdd;
          } else {
            items.push({ product, quantity: quantityToAdd });
          }
        }
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.product.basePrice || 0) * item.quantity, 0);
        set({ items, totalItems, totalPrice });
      },
      removeItem: (productId) => {
        const items = get().items.filter(item => item.product.id !== productId);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.product.basePrice || 0) * item.quantity, 0);
        set({ items, totalItems, totalPrice });
      },
      updateQuantity: (productId, quantity, maxAvailable = Infinity) => {
        let items = [...get().items];
        if (quantity <= 0) {
          items = items.filter(item => item.product.id !== productId);
        } else {
          const item = items.find(item => item.product.id === productId);
          if (item) {
            item.quantity = Math.min(quantity, maxAvailable);
          }
        }
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + (item.product.basePrice || 0) * item.quantity, 0);
        set({ items, totalItems, totalPrice });
      },
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
      getMaxQuantityForProduct: (productId) => {
        // Default max quantity is 10 units per product (can be customized per product)
        return 10;
      },
    }),
    { name: 'cart-storage' }
  )
);

// ============================================================================
// LEGACY CART STORE (For complex cart operations)
// ============================================================================
interface LegacyCartStore {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  addCartItem: (item: CartItem) => void;
  removeCartItem: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCartData: () => void;
  getCartItemCount: () => number;
  syncCartWithRegion: (regionId: string) => void;
}

export const useLegacyCartStore = create<LegacyCartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      setCart: (cart) => set({ cart }),
      addCartItem: (item) => {
        const cart = get().cart;
        if (!cart) {
          set({ cart: { items: [item], summary: { subtotal: item.total, discount: 0, deliveryCost: 0, bonusUsed: 0, total: item.total, itemCount: 1, itemQuantity: item.quantity }, regionId: item.regionData.regionId } });
          return;
        }
        const existing = cart.items.find((i) => i.productId === item.productId);
        const items = existing
          ? cart.items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity, total: i.price * (i.quantity + item.quantity) } : i))
          : [...cart.items, item];
        const summary = { itemCount: items.length, itemQuantity: items.reduce((s, i) => s + i.quantity, 0), subtotal: items.reduce((s, i) => s + i.total, 0), discount: 0, deliveryCost: 0, bonusUsed: 0, total: items.reduce((s, i) => s + i.total, 0) };
        set({ cart: { ...cart, items, summary } });
      },
      removeCartItem: (itemId) => {
        const cart = get().cart;
        if (!cart) return;
        const items = cart.items.filter((i) => i.id !== itemId);
        const summary = { itemCount: items.length, itemQuantity: items.reduce((s, i) => s + i.quantity, 0), subtotal: items.reduce((s, i) => s + i.total, 0), discount: 0, deliveryCost: 0, bonusUsed: 0, total: items.reduce((s, i) => s + i.total, 0) };
        set({ cart: { ...cart, items, summary } });
      },
      updateCartItemQuantity: (itemId, quantity) => {
        const cart = get().cart;
        if (!cart) return;
        const items = quantity <= 0 ? cart.items.filter((i) => i.id !== itemId) : cart.items.map((i) => (i.id === itemId ? { ...i, quantity, total: i.price * quantity } : i));
        const summary = { itemCount: items.length, itemQuantity: items.reduce((s, i) => s + i.quantity, 0), subtotal: items.reduce((s, i) => s + i.total, 0), discount: 0, deliveryCost: 0, bonusUsed: 0, total: items.reduce((s, i) => s + i.total, 0) };
        set({ cart: { ...cart, items, summary } });
      },
      clearCartData: () => set({ cart: null }),
      getCartItemCount: () => get().cart?.items.length || 0,
      syncCartWithRegion: (regionId) => {
        if (get().cart && get().cart!.regionId !== regionId) set({ cart: null });
      },
    }),
    { name: 'legacy-cart-storage' }
  )
);

// ============================================================================
// UI STORE
// ============================================================================
interface UIStore {
  isRegionModalOpen: boolean;
  isAuthModalOpen: boolean;
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  setRegionModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isRegionModalOpen: false,
  isAuthModalOpen: false,
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  setRegionModalOpen: (isRegionModalOpen) => set({ isRegionModalOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setCartDrawerOpen: (isCartDrawerOpen) => set({ isCartDrawerOpen }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
}));

// ============================================================================
// LOYALTY STORE
// ============================================================================
interface LoyaltyStore {
  card: LoyaltyCard | null;
  points: LoyaltyPoints | null;
  transactions: BonusTransaction[];
  referral: ReferralProgram | null;
  setCard: (card: LoyaltyCard | null) => void;
  setPoints: (points: LoyaltyPoints | null) => void;
  setTransactions: (transactions: BonusTransaction[]) => void;
  setReferral: (referral: ReferralProgram | null) => void;
  addTransaction: (transaction: BonusTransaction) => void;
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      card: null,
      points: null,
      transactions: [],
      referral: null,
      setCard: (card) => set({ card }),
      setPoints: (points) => set({ points }),
      setTransactions: (transactions) => set({ transactions }),
      setReferral: (referral) => set({ referral }),
      addTransaction: (transaction) => set({ transactions: [transaction, ...get().transactions] }),
    }),
    { name: 'loyalty-storage' }
  )
);

// ============================================================================
// USER PROFILE STORE
// ============================================================================
interface UserProfileStore {
  paymentCards: PaymentCard[];
  notificationSettings: NotificationSettings;
  addresses: any[];
  favorites: string[]; // Array of product IDs
  setPaymentCards: (cards: PaymentCard[]) => void;
  addPaymentCard: (card: PaymentCard) => void;
  removePaymentCard: (cardId: string) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  setAddresses: (addresses: any[]) => void;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (favorites: string[]) => void;
  clearFavorites: () => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      paymentCards: [],
      notificationSettings: {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
        marketingEnabled: false,
        orderUpdates: true,
        promotions: true,
        loyaltyUpdates: true,
      },
      addresses: [],
      favorites: [],
      setPaymentCards: (cards) => set({ paymentCards: cards }),
      addPaymentCard: (card) => set({ paymentCards: [...get().paymentCards, card] }),
      removePaymentCard: (cardId) => set({ paymentCards: get().paymentCards.filter((c) => c.id !== cardId) }),
      setNotificationSettings: (settings) => set({ notificationSettings: settings }),
      setAddresses: (addresses) => set({ addresses }),
      addToFavorites: (productId) => {
        const favorites = get().favorites;
        if (!favorites.includes(productId)) {
          set({ favorites: [...favorites, productId] });
        }
      },
      removeFromFavorites: (productId) => {
        const favorites = get().favorites.filter((id) => id !== productId);
        set({ favorites });
      },
      isFavorite: (productId) => get().favorites.includes(productId),
      setFavorites: (favorites) => set({ favorites }),
      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: 'user-profile-storage' }
  )
);

// ============================================================================
// ORDERS STORE
// ============================================================================
interface OrdersStore {
  orders: Order[];
  currentOrder: Order | null;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrder: (orderId, updates) => set({
        orders: get().orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
      }),
      setCurrentOrder: (order) => set({ currentOrder: order }),
    }),
    { name: 'orders-storage' }
  )
);

// ============================================================================
// MARKETING STORE
// ============================================================================
interface MarketingStore {
  banners: Banner[];
  promotions: Promotion[];
  setBanners: (banners: Banner[]) => void;
  setPromotions: (promotions: Promotion[]) => void;
}

export const useMarketingStore = create<MarketingStore>((set) => ({
  banners: [],
  promotions: [],
  setBanners: (banners) => set({ banners }),
  setPromotions: (promotions) => set({ promotions }),
}));

// ============================================================================
// FAVORITES STORE
// ============================================================================
interface FavoritesStore {
  favoriteIds: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      addFavorite: (productId: string) => {
        if (!get().favoriteIds.includes(productId)) {
          set({ favoriteIds: [...get().favoriteIds, productId] });
        }
      },
      removeFavorite: (productId: string) => {
        set({ favoriteIds: get().favoriteIds.filter((id) => id !== productId) });
      },
      toggleFavorite: (productId: string) => {
        const exists = get().favoriteIds.includes(productId);
        if (exists) {
          set({ favoriteIds: get().favoriteIds.filter((id) => id !== productId) });
        } else {
          set({ favoriteIds: [...get().favoriteIds, productId] });
        }
      },
      isFavorite: (productId: string) => get().favoriteIds.includes(productId),
      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    { name: 'favorites-storage' }
  )
);

// ============================================================================
// SEARCH STORE
// ============================================================================
interface SearchStore {
  searchHistory: string[];
  popularQueries: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      popularQueries: ['Молоко', 'Шампунь', 'Игрушки', 'Чипсы', 'Моющее', 'Конфеты', 'Подарки'],
      addToHistory: (query: string) => {
        const history = get().searchHistory.filter(q => q !== query);
        set({ searchHistory: [query, ...history].slice(0, 10) });
      },
      removeFromHistory: (query: string) => {
        set({ searchHistory: get().searchHistory.filter(q => q !== query) });
      },
      clearHistory: () => set({ searchHistory: [] }),
    }),
    { name: 'search-storage' }
  )
);
