// ============================================================================
// CORE TYPES - Fix Price Pro PWA
// ============================================================================

export type UserRole = 'user' | 'manager' | 'admin';

export interface Region {
  id: string;
  code: string;
  name: string;
  timezone: string;
  currency: string;
  isActive: boolean;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  regionId: string;
  region: Region;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoyaltyCard {
  id: string;
  cardNumber: string;
  barcode: string;
  qrCode: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'blocked' | 'expired';
  issuedAt: string;
  expiresAt?: string;
}

export interface LoyaltyPoints {
  balance: number;
  pending: number;
  lifetime: number;
  currency: string;
}

export interface BonusTransaction {
  id: string;
  type: 'accrual' | 'writeoff' | 'expire';
  amount: number;
  balance: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

// Loyalty types for UI
export interface LoyaltyInfo {
  cardNumber: string;
  points: number;
  level: string;
  discount: number;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'spend';
  points: number;
  description: string;
  createdAt: string;
}

export interface ReferralProgram {
  code: string;
  link: string;
  totalInvited: number;
  totalEarned: number;
  rewardAmount: number;
}

export interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'mir' | 'other';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
  token: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  marketingEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyUpdates: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  children: Category[];
  sortOrder: number;
  isActive: boolean;
  regionIds: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  sortOrder: number;
}

export interface ProductSpec {
  name: string;
  value: string;
  unit?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: ProductImage[];
  categoryId: string;
  category: Category;
  brand?: string;
  country?: string;
  barcode: string;
  sku: string;
  weight?: number;
  specifications: ProductSpec[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // UI convenience properties
  basePrice: number;
  baseOldPrice?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  cardPrice?: number; // Special price for loyalty card holders
  outOfStock?: boolean; // Product availability flag
}

export interface StockInfo {
  warehouse: number;
  stores: { storeId: string; quantity: number }[];
  total: number;
  reserved: number;
  available: number;
}

export interface ProductRegionData {
  productId: string;
  regionId: string;
  price: number;
  oldPrice?: number;
  cardPrice?: number;
  currency: string;
  stock: StockInfo;
  isAvailable: boolean;
  minOrderQty: number;
  maxOrderQty: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  regionData: ProductRegionData;
  quantity: number;
  price: number;
  total: number;
  addedAt: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryCost: number;
  bonusUsed: number;
  total: number;
  itemCount: number;
  itemQuantity: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  regionId: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  regionId: string;
  phone: string;
  email?: string;
  schedule: {
    monday: DaySchedule; tuesday: DaySchedule; wednesday: DaySchedule;
    thursday: DaySchedule; friday: DaySchedule; saturday: DaySchedule; sunday: DaySchedule;
  };
  coordinates: { lat: number; lng: number };
  services: string[];
  isActive: boolean;
}

export interface DaySchedule {
  isOpen: boolean;
  open?: string;
  close?: string;
}

export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: OrderDelivery;
  payment: OrderPayment;
  summary: OrderSummary;
  bonuses: OrderBonuses;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDelivery {
  method: string;
  storeId?: string;
  storeName?: string;
  address?: DeliveryAddress;
  cost: number;
  estimatedDate: string;
  actualDate?: string;
  trackingNumber?: string;
}

export interface DeliveryAddress {
  city: string;
  street: string;
  building: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  comment?: string;
}

export interface OrderPayment {
  method: string;
  cardId?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
}

export interface OrderSummary {
  subtotal: number;
  deliveryCost: number;
  discount: number;
  bonusUsed: number;
  total: number;
}

export interface OrderBonuses {
  earned: number;
  used: number;
  rate: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  bannerImage: string;
  type: 'discount' | 'gift' | 'bundle' | 'points';
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  regionIds: string[];
  productIds?: string[];
  categoryIds?: string[];
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link: string;
  linkType: 'internal' | 'external';
  position: 'home_main' | 'home_secondary' | 'category';
  sortOrder: number;
  regionIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, string[]> };
  meta?: { page: number; perPage: number; total: number; totalPages: number };
}

export interface ScanResult {
  barcode: string;
  format: string;
  product?: Product;
  found: boolean;
}
