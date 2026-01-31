/**
 * Background Sync Service для offline-first синхронизации
 * Используется для синхронизации заказов, отзывов и т.д. когда пользователь вернулся онлайн
 */

interface SyncTask {
  id: string;
  type: 'order' | 'review' | 'favorite' | 'cart' | 'notification';
  data: Record<string, any>;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

class BackgroundSyncService {
  private dbName = 'FixPriceSyncDB';
  private dbVersion = 1;
  private storeName = 'sync_tasks';
  private db: IDBDatabase | null = null;
  private maxRetries = 3;
  private isSyncing = false;

  constructor() {
    this.initDB();
    this.setupSyncListener();
  }

  // Инициализация IndexedDB для sync tasks
  private initDB() {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      this.db = (e.target as IDBOpenDBRequest).result;
      console.log('✅ SyncDB инициализирована');
      // Попробовать синхронизировать при инициализации
      this.syncPendingTasks();
    };

    request.onerror = () => {
      console.error('❌ Ошибка инициализации SyncDB');
    };
  }

  // Слушать переход в online и запускать синхронизацию
  private setupSyncListener() {
    window.addEventListener('online', () => {
      console.log('🟢 Соединение восстановлено, начинаем синхронизацию...');
      this.syncPendingTasks();
    });

    // Попробовать синхронизировать каждые 30 секунд если есть pending tasks
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncPendingTasks();
      }
    }, 30000);
  }

  // Добавить новую задачу синхронизации
  async addTask(
    type: SyncTask['type'],
    data: Record<string, any>
  ): Promise<string> {
    if (!this.db) {
      console.warn('⚠️ SyncDB не инициализирована');
      throw new Error('Database not initialized');
    }

    const task: SyncTask = {
      id: `sync_${type}_${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(task);

      request.onsuccess = () => {
        console.log(`📌 Задача добавлена: ${task.id}`);
        resolve(task.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Синхронизировать все pending tasks
  async syncPendingTasks(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;

    try {
      const tasks = await this.getPendingTasks();
      console.log(`🔄 Синхронизация ${tasks.length} задач...`);

      for (const task of tasks) {
        await this.syncTask(task);
      }
    } catch (error) {
      console.error('❌ Ошибка при синхронизации:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Синхронизировать одну задачу
  private async syncTask(task: SyncTask): Promise<void> {
    if (!navigator.onLine) {
      console.warn('⚠️ Нет соединения, пропускаем синхронизацию');
      return;
    }

    try {
      await this.updateTaskStatus(task.id, 'syncing');

      // Обработать разные типы задач
      switch (task.type) {
        case 'order':
          await this.syncOrder(task.data);
          break;
        case 'review':
          await this.syncReview(task.data);
          break;
        case 'favorite':
          await this.syncFavorite(task.data);
          break;
        case 'cart':
          await this.syncCart(task.data);
          break;
        case 'notification':
          await this.syncNotification(task.data);
          break;
      }

      await this.updateTaskStatus(task.id, 'completed');
      console.log(`✅ Задача синхронизирована: ${task.id}`);
    } catch (error) {
      console.error(`❌ Ошибка при синхронизации ${task.id}:`, error);

      if (task.retries < this.maxRetries) {
        await this.incrementRetries(task.id);
      } else {
        await this.updateTaskStatus(task.id, 'failed');
      }
    }
  }

  // Вспомогательные методы для синхронизации разных типов

  private async syncOrder(orderData: any): Promise<void> {
    // Имитация запроса к API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📦 Заказ синхронизирован:', orderData);
        resolve();
      }, 1000);
    });
  }

  private async syncReview(reviewData: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('⭐ Отзыв синхронизирован:', reviewData);
        resolve();
      }, 1000);
    });
  }

  private async syncFavorite(favoriteData: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('❤️ Избранное синхронизировано:', favoriteData);
        resolve();
      }, 1000);
    });
  }

  private async syncCart(cartData: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🛒 Корзина синхронизирована:', cartData);
        resolve();
      }, 1000);
    });
  }

  private async syncNotification(notifData: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🔔 Уведомление синхронизировано:', notifData);
        resolve();
      }, 1000);
    });
  }

  // Получить все pending tasks
  private async getPendingTasks(): Promise<SyncTask[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Обновить статус задачи
  private async updateTaskStatus(
    id: string,
    status: SyncTask['status']
  ): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const task = request.result;
        if (task) {
          task.status = status;
          const updateRequest = store.put(task);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Увеличить количество retry
  private async incrementRetries(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const task = request.result;
        if (task) {
          task.retries++;
          const updateRequest = store.put(task);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Получить статистику синхронизации
  async getSyncStats(): Promise<{
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
  }> {
    if (!this.db) {
      return { pending: 0, syncing: 0, completed: 0, failed: 0 };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const tasks = request.result as SyncTask[];
        const stats = {
          pending: tasks.filter((t) => t.status === 'pending').length,
          syncing: tasks.filter((t) => t.status === 'syncing').length,
          completed: tasks.filter((t) => t.status === 'completed').length,
          failed: tasks.filter((t) => t.status === 'failed').length,
        };
        resolve(stats);
      };
    });
  }
}

// Экспортировать singleton instance
export const backgroundSyncService = new BackgroundSyncService();
export default BackgroundSyncService;
