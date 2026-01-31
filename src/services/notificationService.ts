/**
 * Notification Service для Web Push Notifications
 * Поддерживает offline режим с IndexedDB
 */

interface StoredNotification {
  id: string;
  title: string;
  options: NotificationOptions;
  timestamp: number;
  sent: boolean;
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
      console.log('✅ NotificationDB инициализирована');
    };

    request.onerror = () => {
      console.error('❌ Ошибка инициализации NotificationDB');
    };
  }

  // Проверить поддержку Notifications API
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Получить статус разрешений
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission || 'default';
  }

  // Запросить разрешение на уведомления
  async requestPermission(): Promise<boolean> {
    if (!NotificationService.isSupported()) {
      console.warn('⚠️ Notifications API не поддерживается');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('❌ Ошибка при запросе разрешения:', error);
        return false;
      }
    }

    return false;
  }

  // Отправить простое уведомление
  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!NotificationService.isSupported()) {
      console.warn('⚠️ Notifications не поддерживаются');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      // Если есть Service Worker, используем его
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: options || {},
        });
      } else {
        // Fallback на обычное уведомление
        new Notification(title, options);
      }

      // Сохранить в IndexedDB для логирования
      await this.storeNotification(title, options);
    } catch (error) {
      console.error('❌ Ошибка при отправке уведомления:', error);
    }
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
