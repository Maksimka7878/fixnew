/**
 * Notification Service для Web Push Notifications
 * Поддерживает offline режим с IndexedDB
 * Поддерживает iOS 16.4+ (только в установленном PWA)
 */

interface StoredNotification {
  id: string;
  title: string;
  options: NotificationOptions;
  timestamp: number;
  sent: boolean;
}

export interface NotificationDiagnostics {
  isSupported: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerActive: boolean;
  reason: string;
}

class NotificationService {
  private dbName = 'FixPriceDB';
  private dbVersion = 1;
  private storeName = 'notifications';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  // Инициализация IndexedDB для offline уведомлений
  private initDB() {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      this.db = (e.target as IDBOpenDBRequest).result;
    };

    request.onerror = () => {
      console.error('Ошибка инициализации NotificationDB');
    };
  }

  // Определить iOS
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  // Проверить что приложение установлено как PWA (standalone)
  static isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
  }

  // Проверить поддержку Notifications API
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Полная диагностика состояния уведомлений
  static async getDiagnostics(): Promise<NotificationDiagnostics & {
    registrations?: string[];
    swError?: string;
    swUrl?: string;
  }> {
    const isIOS = NotificationService.isIOS();
    const isStandalone = NotificationService.isStandalone();
    const isSupported = NotificationService.isSupported();

    let serviceWorkerActive = false;
    let registrations: string[] = [];
    let swError: string | undefined;
    let swUrl: string | undefined;

    try {
      if ('serviceWorker' in navigator) {
        // Get all registrations
        const regs = await navigator.serviceWorker.getRegistrations();
        registrations = regs.map(r => r.scope);

        // Get current registration
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          serviceWorkerActive = !!reg.active;
          swUrl = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL;
        }

        // Log detailed info
        console.log('🔍 SW Diagnostics:', {
          registrations: regs.length,
          scopes: registrations,
          hasActive: serviceWorkerActive,
          swUrl,
          controller: !!navigator.serviceWorker.controller,
        });
      }
    } catch (error) {
      swError = error instanceof Error ? error.message : String(error);
      console.error('❌ SW getRegistration error:', error);
    }

    let permission: NotificationPermission | 'unsupported' = 'unsupported';
    if (isSupported) {
      permission = Notification.permission;
    }

    let reason = '';
    if (!isSupported) {
      if (isIOS && !isStandalone) {
        reason = 'ios_not_installed';
      } else {
        reason = 'not_supported';
      }
    } else if (permission === 'denied') {
      reason = 'denied';
    } else if (!serviceWorkerActive) {
      reason = 'no_service_worker';
    } else {
      reason = 'ready';
    }

    return {
      isSupported,
      isIOS,
      isStandalone,
      permission,
      serviceWorkerActive,
      reason,
      registrations,
      swError,
      swUrl,
    };
  }

  // Попытаться вручную зарегистрировать SW
  static async manualRegisterSW(): Promise<{ success: boolean; error?: string; scope?: string }> {
    try {
      if (!('serviceWorker' in navigator)) {
        return { success: false, error: 'serviceWorker not in navigator' };
      }

      console.log('🔧 Attempting manual SW registration...');

      // Try to register /sw.js
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Manual SW registration result:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
      });

      // Wait for activation
      if (registration.installing) {
        await new Promise<void>((resolve) => {
          registration.installing!.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              resolve();
            }
          });
        });
      }

      return { success: true, scope: registration.scope };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Manual SW registration failed:', error);
      return { success: false, error: errorMsg };
    }
  }

  // Получить статус разрешений
  static getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  // Запросить разрешение на уведомления
  async requestPermission(): Promise<boolean> {
    if (!NotificationService.isSupported()) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch {
        return false;
      }
    }

    return false;
  }

  // Отправить простое уведомление
  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!NotificationService.isSupported()) {
      throw new Error(
        NotificationService.isIOS() && !NotificationService.isStandalone()
          ? 'Добавьте приложение на домашний экран для получения уведомлений'
          : 'Уведомления не поддерживаются в этом браузере'
      );
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Разрешение на уведомления не получено');
      }
    }

    try {
      // Используем Service Worker registration для системных уведомлений
      const registration = await navigator.serviceWorker.ready;

      if (!registration) {
        throw new Error('Service Worker registration failed');
      }

      const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
        icon: '/logo.svg',
        badge: '/logo.svg',
        ...options,
      };

      // Показать уведомление через Service Worker
      await registration.showNotification(title, notificationOptions);

      console.log('✅ Notification sent:', title);
    } catch (error) {
      console.error('❌ SW notification error:', error);

      // Fallback: отправить уведомление напрямую через Notification API
      try {
        new Notification(title, {
          icon: '/logo.svg',
          badge: '/logo.svg',
          ...options,
        });
        console.log('✅ Fallback notification sent:', title);
      } catch (fallbackError) {
        console.error('❌ Fallback notification error:', fallbackError);
        throw new Error('Не удалось отправить уведомление');
      }
    }

    // Сохранить в IndexedDB для логирования
    await this.storeNotification(title, options);
  }

  // Сохранить уведомление в IndexedDB
  private async storeNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB не инициализирована');
      return;
    }

    const notification: StoredNotification = {
      id: `notif_${Date.now()}`,
      title,
      options: options || {},
      timestamp: Date.now(),
      sent: Notification.permission === 'granted',
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(notification);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Отправить уведомление о новом товаре
  async notifyNewProduct(product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  }): Promise<void> {
    await this.show(`🆕 Новинка: ${product.name}`, {
      body: `Цена: ${product.price} ₽`,
      icon: product.image || '/logo.svg',
      badge: '/logo.svg',
      tag: `product_${product.id}`,
      requireInteraction: false,
      data: { productId: product.id, action: 'open_product' },
    });
  }

  // Отправить уведомление о скидке
  async notifyDiscount(discount: {
    title: string;
    description: string;
    discount_percent: number;
    image?: string;
  }): Promise<void> {
    await this.show(`🔥 ${discount.title}`, {
      body: `${discount.description} (${discount.discount_percent}% скидка)`,
      icon: discount.image || '/logo.svg',
      badge: '/logo.svg',
      tag: 'discount',
      requireInteraction: true,
      data: { action: 'open_promotions' },
    });
  }

  // Отправить уведомление о статусе заказа
  async notifyOrderStatus(order: {
    orderId: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    trackingNumber?: string;
  }): Promise<void> {
    const statusMessages = {
      pending: '⏳ Ваш заказ ожидает подтверждения',
      confirmed: '✅ Заказ подтвержден',
      shipped: '📦 Заказ отправлен',
      delivered: '🎉 Заказ доставлен',
    };

    await this.show(statusMessages[order.status], {
      body: order.trackingNumber
        ? `Номер отслеживания: ${order.trackingNumber}`
        : `ID заказа: ${order.orderId}`,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: `order_${order.orderId}`,
      data: { orderId: order.orderId, action: 'open_order' },
    });
  }

  // Отправить уведомление о восстановлении корзины
  async notifyCartRecovered(itemCount: number): Promise<void> {
    await this.show('🛒 Ваша корзина восстановлена', {
      body: `${itemCount} товаров в ожидании оформления`,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'cart_recovered',
      data: { action: 'open_cart' },
    });
  }

  // Отправить уведомление о бонусах
  async notifyBonusPoints(points: number, reason: string): Promise<void> {
    await this.show(`⭐ Вы получили ${points} бонусов!`, {
      body: `${reason}`,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'bonus_points',
      data: { action: 'open_loyalty' },
    });
  }

  // Отправить уведомление о восстановлении соединения
  async notifyConnectionRestored(): Promise<void> {
    await this.show('🟢 Вы в сети', {
      body: 'Соединение восстановлено',
      tag: 'connection_status',
      requireInteraction: false,
    });
  }

  // Отправить уведомление о доступности offline
  async notifyOfflineMode(): Promise<void> {
    await this.show('🔴 Вы в режиме offline', {
      body: 'Приложение будет синхронизировано при появлении интернета',
      tag: 'connection_status',
      requireInteraction: true,
    });
  }

  // Получить все сохранённые уведомления
  async getAllNotifications(): Promise<StoredNotification[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Очистить сохранённые уведомления
  async clearNotifications(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Экспортировать singleton instance
export const notificationService = new NotificationService();
export default NotificationService;
