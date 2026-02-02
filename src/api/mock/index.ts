import { useState, useCallback } from 'react';
import type {
  Region, User, AuthTokens,
  Category, Product, Order,
  Promotion, Banner, ApiResponse, ScanResult, LoyaltyInfo, LoyaltyTransaction
} from '@/types';
import { PRODUCTS, CATEGORIES } from './data/products';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_REGIONS: Region[] = [
  { id: 'r1', code: 'MOW', name: 'Москва', timezone: 'Europe/Moscow', currency: 'RUB', isActive: true },
  { id: 'r2', code: 'SPB', name: 'Санкт-Петербург', timezone: 'Europe/Moscow', currency: 'RUB', isActive: true },
  { id: 'r3', code: 'NSK', name: 'Новосибирск', timezone: 'Asia/Novosibirsk', currency: 'RUB', isActive: true },
];

const MOCK_CATEGORIES = CATEGORIES;
const MOCK_PRODUCTS = PRODUCTS;

const MOCK_PROMOTIONS: Promotion[] = [
  { id: 'promo1', name: 'Скидка 20% на молочные продукты', description: 'Только этой неделе! Скидка на все молочные продукты.', bannerImage: 'https://placehold.co/800x400/22c55e/white?text=Sale', type: 'discount', discountType: 'percent', discountValue: 20, startDate: '2024-01-01', endDate: '2024-12-31', regionIds: ['r1', 'r2', 'r3'], categoryIds: ['c1'], isActive: true },
  { id: 'promo2', name: '3 по цене 2', description: 'Купите 3 товара, заплатите за 2!', bannerImage: 'https://placehold.co/800x400/DC143C/white?text=3for2', type: 'bundle', startDate: '2024-01-01', endDate: '2024-12-31', regionIds: ['r1', 'r2', 'r3'], isActive: true },
  { id: 'promo3', name: 'Двойные бонусы', description: 'Получите двойные бонусы за покупки в выходные.', bannerImage: 'https://placehold.co/800x400/4169E1/white?text=Bonus', type: 'points', startDate: '2024-01-01', endDate: '2024-12-31', regionIds: ['r1', 'r2', 'r3'], isActive: true },
];

const MOCK_BANNERS: Banner[] = [
  { id: 'b1', title: 'Новые поступления', subtitle: 'Более 1000 новых товаров', image: '/images/products/shampoo-lifestyle.webp', link: '/catalog', linkType: 'internal', position: 'home_main', sortOrder: 1, regionIds: ['r1', 'r2', 'r3'], startDate: '2024-01-01', endDate: '2024-12-31', isActive: true },
  { id: 'b2', title: 'Скидки до 50%', subtitle: 'На бытовую химию', image: '/images/products/tide-lifestyle.webp', link: '/catalog/bytovaya-khimiya', linkType: 'internal', position: 'home_main', sortOrder: 2, regionIds: ['r1', 'r2', 'r3'], startDate: '2024-01-01', endDate: '2024-12-31', isActive: true },
  { id: 'b3', title: 'Вкусные предложения', subtitle: 'Любимые напитки и закуски', image: '/images/products/cola-lifestyle.webp', link: '/catalog/produkty', linkType: 'internal', position: 'home_main', sortOrder: 3, regionIds: ['r1', 'r2', 'r3'], startDate: '2024-01-01', endDate: '2024-12-31', isActive: true },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'FP-2024-001',
    userId: 'u1',
    status: 'completed',
    items: [
      { id: 'oi1', productId: 'p1', productName: 'Молоко 3.2% 1л', productImage: 'https://placehold.co/100x100/22c55e/white?text=Milk', sku: 'MILK-001', quantity: 2, price: 89.99, total: 179.98 },
      { id: 'oi2', productId: 'p3', productName: 'Coca-Cola 1.5л', productImage: 'https://placehold.co/100x100/DC143C/white?text=Cola', sku: 'COLA-001', quantity: 1, price: 129.00, total: 129.00 },
    ],
    delivery: { method: 'courier', cost: 0, estimatedDate: '2024-01-16', address: { city: 'Москва', street: 'Тверская', building: '15' } },
    payment: { method: 'card', status: 'paid', paidAt: '2024-01-15T10:00:00Z' },
    summary: { subtotal: 308.98, deliveryCost: 0, discount: 0, bonusUsed: 0, total: 308.98 },
    bonuses: { earned: 15, used: 0, rate: 0.05 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-16T14:00:00Z',
  },
  {
    id: 'o2',
    orderNumber: 'FP-2024-002',
    userId: 'u1',
    status: 'delivering',
    items: [
      { id: 'oi3', productId: 'p4', productName: 'Tide 3кг', productImage: 'https://placehold.co/100x100/FFA500/white?text=Tide', sku: 'TIDE-001', quantity: 1, price: 599.00, total: 599.00 },
    ],
    delivery: { method: 'courier', cost: 0, estimatedDate: '2024-01-18', trackingNumber: 'TRK123456' },
    payment: { method: 'card', status: 'paid', paidAt: '2024-01-17T12:00:00Z' },
    summary: { subtotal: 599.00, deliveryCost: 0, discount: 0, bonusUsed: 0, total: 599.00 },
    bonuses: { earned: 30, used: 0, rate: 0.05 },
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-01-17T12:00:00Z',
  },
];

// ============================================================================
// AUTH API
// ============================================================================
export function useMockAuthApi() {
  const [isLoading, setIsLoading] = useState(false);

  const sendSms = useCallback(async (_phone: string): Promise<ApiResponse<{ requestId: string }>> => {
    setIsLoading(true);
    await delay(1000);
    setIsLoading(false);
    return { success: true, data: { requestId: Math.random().toString(36).substring(2) } };
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    setIsLoading(true);
    await delay(1500);
    setIsLoading(false);
    if (!/^\d{4}$/.test(code)) return { success: false, error: { code: 'INVALID_OTP', message: 'Неверный код' } };
    const user: User = { id: 'u1', phone, firstName: 'Иван', lastName: 'Иванов', regionId: 'r1', region: MOCK_REGIONS[0], role: 'user', isVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const tokens: AuthTokens = { accessToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 86400000 };
    return { success: true, data: { user, tokens } };
  }, []);

  return { isLoading, sendSms, verifyOtp };
}

// ============================================================================
// CATALOG API
// ============================================================================
export function useMockCatalogApi() {
  const [isLoading, setIsLoading] = useState(false);

  const getRegions = useCallback(async (): Promise<ApiResponse<Region[]>> => {
    setIsLoading(true);
    await delay(100);
    setIsLoading(false);
    return { success: true, data: MOCK_REGIONS };
  }, []);

  const getCategories = useCallback(async (regionId?: string): Promise<ApiResponse<Category[]>> => {
    setIsLoading(true);
    await delay(150);
    setIsLoading(false);
    return { success: true, data: regionId ? MOCK_CATEGORIES.filter((c) => c.regionIds.includes(regionId)) : MOCK_CATEGORIES };
  }, []);

  const getProducts = useCallback(async (params?: { regionId?: string; categoryId?: string; search?: string }): Promise<ApiResponse<Product[]>> => {
    setIsLoading(true);
    await delay(200);
    let products = [...MOCK_PRODUCTS];
    if (params?.categoryId) {
      products = products.filter(p => p.categoryId === params.categoryId);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(searchLower));
    }
    setIsLoading(false);
    return { success: true, data: products };
  }, []);

  const getProductBySlug = useCallback(async (slug: string): Promise<ApiResponse<Product>> => {
    setIsLoading(true);
    await delay(150);
    const product = MOCK_PRODUCTS.find(p => p.slug === slug);
    setIsLoading(false);
    if (product) {
      return { success: true, data: product };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Товар не найден' } };
  }, []);

  const searchProducts = useCallback(async (query: string): Promise<ApiResponse<Product[]>> => {
    setIsLoading(true);
    await delay(150);
    const searchLower = query.toLowerCase();
    const products = MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower)
    );
    setIsLoading(false);
    return { success: true, data: products };
  }, []);

  const scanBarcode = useCallback(async (barcode: string, _regionId: string): Promise<ApiResponse<ScanResult>> => {
    setIsLoading(true);
    await delay(300);
    setIsLoading(false);
    const product = MOCK_PRODUCTS.find((p) => p.barcode === barcode);
    return { success: true, data: { barcode, format: 'EAN-13', product, found: !!product } };
  }, []);

  return { isLoading, getRegions, getCategories, getProducts, getProductBySlug, searchProducts, scanBarcode };
}

// ============================================================================
// MARKETING API
// ============================================================================
export function useMockMarketingApi() {
  const [isLoading, setIsLoading] = useState(false);

  const getPromotions = useCallback(async (regionId?: string): Promise<ApiResponse<Promotion[]>> => {
    setIsLoading(true);
    await delay(150);
    setIsLoading(false);
    return { success: true, data: regionId ? MOCK_PROMOTIONS.filter((p) => p.regionIds.includes(regionId)) : MOCK_PROMOTIONS };
  }, []);

  const getBanners = useCallback(async (params: { position: Banner['position']; regionId: string }): Promise<ApiResponse<Banner[]>> => {
    setIsLoading(true);
    await delay(100);
    setIsLoading(false);
    return { success: true, data: MOCK_BANNERS.filter((b) => b.position === params.position && b.regionIds.includes(params.regionId)) };
  }, []);

  return { isLoading, getPromotions, getBanners };
}

// ============================================================================
// ORDERS API
// ============================================================================
export function useMockOrdersApi() {
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = useCallback(async (_orderData: any): Promise<ApiResponse<Order>> => {
    setIsLoading(true);
    await delay(400);
    const order: Order = { id: 'o1', orderNumber: 'FP-001', userId: 'u1', status: 'new', items: [], delivery: { method: 'pickup', cost: 0, estimatedDate: new Date().toISOString() }, payment: { method: 'card', status: 'pending' }, summary: { subtotal: 1000, deliveryCost: 0, discount: 0, bonusUsed: 0, total: 1000 }, bonuses: { earned: 50, used: 0, rate: 0.05 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setIsLoading(false);
    return { success: true, data: order };
  }, []);

  const getOrders = useCallback(async (_userId: string): Promise<ApiResponse<Order[]>> => {
    setIsLoading(true);
    await delay(200);
    setIsLoading(false);
    return { success: true, data: MOCK_ORDERS };
  }, []);

  return { isLoading, createOrder, getOrders };
}

// ============================================================================
// LOYALTY API
// ============================================================================
export function useMockLoyaltyApi() {
  const [isLoading, setIsLoading] = useState(false);

  const getLoyaltyInfo = useCallback(async (_userId: string): Promise<ApiResponse<LoyaltyInfo>> => {
    setIsLoading(true);
    await delay(150);
    setIsLoading(false);
    const info: LoyaltyInfo = {
      cardNumber: '1234 5678 9012 3456',
      points: 2580,
      level: 'Gold',
      discount: 5,
    };
    return { success: true, data: info };
  }, []);

  const getLoyaltyHistory = useCallback(async (_userId: string): Promise<ApiResponse<LoyaltyTransaction[]>> => {
    setIsLoading(true);
    await delay(150);
    const transactions: LoyaltyTransaction[] = [
      { id: 't1', type: 'earn', points: 50, description: 'Начисление за заказ #FP-2024-001', createdAt: '2024-01-15T10:00:00Z' },
      { id: 't2', type: 'earn', points: 30, description: 'Начисление за заказ #FP-2024-002', createdAt: '2024-01-17T12:00:00Z' },
      { id: 't3', type: 'spend', points: 100, description: 'Списание при оплате заказа #FP-2024-003', createdAt: '2024-01-18T15:00:00Z' },
      { id: 't4', type: 'earn', points: 75, description: 'Бонус за отзыв', createdAt: '2024-01-19T09:00:00Z' },
      { id: 't5', type: 'earn', points: 200, description: 'Промо-начисление "Двойные бонусы"', createdAt: '2024-01-20T10:00:00Z' },
    ];
    setIsLoading(false);
    return { success: true, data: transactions };
  }, []);

  return { isLoading, getLoyaltyInfo, getLoyaltyHistory };
}
