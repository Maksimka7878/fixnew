# PWA Notifications & Offline-First Guide

## 🎯 Что реализовано

### 1. **Web Push Notifications** 📱
- ✅ Push API с поддержкой offline режима
- ✅ IndexedDB для хранения уведомлений
- ✅ Управление разрешениями на уведомления
- ✅ Различные типы уведомлений (заказы, скидки, товары, бонусы)
- ✅ Полная история уведомлений

### 2. **Notification Center** 🔔
- ✅ UI компонент для управления уведомлениями
- ✅ Статус соединения (online/offline)
- ✅ Включение/отключение уведомлений
- ✅ Тестирование уведомлений
- ✅ История последних 10 уведомлений
- ✅ Возможность очистки истории

### 3. **Background Sync** 🔄
- ✅ Автоматическая синхронизация при возвращении online
- ✅ IndexedDB для хранения pending задач
- ✅ Поддержка разных типов задач (заказы, отзывы, избранное, корзина)
- ✅ Повторные попытки с ограничением (max 3 попытки)
- ✅ Статистика синхронизации

### 4. **Auto-Update PWA** ♻️
- ✅ Автоматическое обновление приложения
- ✅ Prompt для установки обновлений
- ✅ Проверка обновлений каждые 60 секунд
- ✅ Smooth refresh при обновлении

---

## 📦 Созданные компоненты и сервисы

### Сервисы

#### `src/services/notificationService.ts`
Основной сервис для управления уведомлениями.

**Методы:**
```typescript
// Запросить разрешение на уведомления
await notificationService.requestPermission();

// Отправить простое уведомление
await notificationService.show('Заголовок', {
  body: 'Описание',
  icon: '/logo.svg',
});

// Специализированные уведомления
await notificationService.notifyNewProduct({
  id: '123',
  name: 'Новый товар',
  price: 99,
  image: '/image.jpg',
});

await notificationService.notifyDiscount({
  title: 'Скидка 50%',
  description: 'На избранные товары',
  discount_percent: 50,
});

await notificationService.notifyOrderStatus({
  orderId: 'ORD123',
  status: 'shipped',
  trackingNumber: 'TRACK123',
});

await notificationService.notifyBonusPoints(100, 'За покупку');

// Получить все сохранённые уведомления
const notifications = await notificationService.getAllNotifications();

// Очистить уведомления
await notificationService.clearNotifications();
```

#### `src/services/backgroundSyncService.ts`
Сервис для offline-first синхронизации.

**Методы:**
```typescript
// Добавить задачу синхронизации
const taskId = await backgroundSyncService.addTask('order', {
  orderId: '123',
  items: [...],
});

// Синхронизировать все pending задачи
await backgroundSyncService.syncPendingTasks();

// Получить статистику
const stats = await backgroundSyncService.getSyncStats();
// { pending: 2, syncing: 0, completed: 5, failed: 1 }
```

### Компоненты UI

#### `src/components/pwa/NotificationCenter.tsx`
Диалог для управления уведомлениями и синхронизацией.

**Особенности:**
- Показывает статус соединения (online/offline)
- Переключатель для включения/отключения уведомлений
- Кнопка тестирования уведомлений
- История последних 10 уведомлений
- Кнопка синхронизации (активна только offline)

#### `src/components/pwa/UpdatePrompt.tsx`
Уведомление об обновлении приложения.

**Особенности:**
- Автоматическое появление при наличии обновления
- Кнопки "Обновить" и "Позже"
- Плавное обновление с перезагрузкой страницы
- Проверка обновлений каждые 60 секунд

---

## 🚀 Как использовать

### 1. Отправить уведомление о новом товаре

```typescript
import { notificationService } from '@/services/notificationService';

// В компоненте или API обработчике
await notificationService.notifyNewProduct({
  id: product.id,
  name: product.name,
  price: product.basePrice,
  image: product.images[0]?.url,
});
```

### 2. Отправить уведомление о скидке

```typescript
await notificationService.notifyDiscount({
  title: 'Мега распродажа!',
  description: 'Скидки на категорию "Кухня"',
  discount_percent: 50,
  image: '/promo-banner.jpg',
});
```

### 3. Обновить статус заказа

```typescript
await notificationService.notifyOrderStatus({
  orderId: order.id,
  status: 'shipped',
  trackingNumber: order.tracking_number,
});
```

### 4. Добавить задачу синхронизации (offline)

```typescript
import { backgroundSyncService } from '@/services/backgroundSyncService';

// Пользователь оставляет отзыв в offline режиме
await backgroundSyncService.addTask('review', {
  productId: product.id,
  rating: 5,
  text: 'Отличный товар!',
  author: user.name,
});

// При возвращении онлайн, задача автоматически синхронизируется
```

### 5. Проверить уведомления в UI

```typescript
import { notificationService } from '@/services/notificationService';

// В компоненте
useEffect(() => {
  const checkNotifications = async () => {
    const status = notificationService.constructor.getPermissionStatus();
    setNotificationsEnabled(status === 'granted');
  };

  checkNotifications();
}, []);
```

---

## 🔧 Интеграция в компоненты

### Интеграция уведомлений при покупке

```typescript
// src/pages/cart/CheckoutPage.tsx

import { notificationService } from '@/services/notificationService';
import { backgroundSyncService } from '@/services/backgroundSyncService';

const handleSubmit = async () => {
  try {
    if (paymentMethod === 'card') {
      // Создать платёж
      const paymentResponse = await PaymentService.createPayment(...);

      // Отправить уведомление о новом заказе
      if (navigator.onLine) {
        await notificationService.notifyOrderStatus({
          orderId: order.id,
          status: 'pending',
        });
      } else {
        // Если offline, добавить в очередь синхронизации
        await backgroundSyncService.addTask('order', {
          orderId: order.id,
          total: total,
          items: items,
        });
      }
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
```

### Интеграция при добавлении в избранное

```typescript
// src/components/product/ProductCard.tsx

import { backgroundSyncService } from '@/services/backgroundSyncService';

const handleAddToFavorites = async (productId: string) => {
  try {
    // Добавить в локальное хранилище
    toggleFavorite(productId);

    // Добавить в очередь синхронизации
    if (!navigator.onLine) {
      await backgroundSyncService.addTask('favorite', {
        productId,
        action: 'add',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
```

---

## 📊 Управление разрешениями

### Проверить статус разрешений

```typescript
import { notificationService } from '@/services/notificationService';

// Проверить поддержку
const isSupported = notificationService.constructor.isSupported();

// Получить статус
const status = notificationService.constructor.getPermissionStatus();
// 'granted' | 'denied' | 'default'
```

### Запросить разрешение

```typescript
const granted = await notificationService.requestPermission();
if (granted) {
  console.log('✅ Уведомления включены');
} else {
  console.log('❌ Уведомления отклонены');
}
```

---

## 🗄️ IndexedDB структура

### Notifications Store
```typescript
{
  id: 'notif_1234567890',
  title: '🆕 Новинка: Товар',
  options: {
    body: 'Цена: 99 ₽',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'product_123',
    data: { productId: '123', action: 'open_product' }
  },
  timestamp: 1234567890,
  sent: true
}
```

### Sync Tasks Store
```typescript
{
  id: 'sync_order_1234567890',
  type: 'order' | 'review' | 'favorite' | 'cart' | 'notification',
  data: { /* task data */ },
  timestamp: 1234567890,
  retries: 0,
  status: 'pending' | 'syncing' | 'failed' | 'completed'
}
```

---

## 🔐 Безопасность

### Разрешения
- Уведомления требуют явного разрешения пользователя
- Разрешение запрашивается один раз при первом использовании
- Пользователь может включить/отключить в Notification Center

### Data Privacy
- Все данные хранятся локально в IndexedDB
- Ничего не отправляется на сервер без согласия
- Service Worker выполняется в изолированной среде

---

## 📈 Мониторинг и статистика

### Получить статистику синхронизации

```typescript
import { backgroundSyncService } from '@/services/backgroundSyncService';

const stats = await backgroundSyncService.getSyncStats();
console.log(`
  Ожидание: ${stats.pending}
  Синхронизация: ${stats.syncing}
  Завершено: ${stats.completed}
  Ошибок: ${stats.failed}
`);
```

### Слушать события соединения

```typescript
window.addEventListener('online', () => {
  console.log('🟢 Вы в сети');
  backgroundSyncService.syncPendingTasks();
});

window.addEventListener('offline', () => {
  console.log('🔴 Вы в режиме offline');
});
```

---

## 🐛 Отладка

### Включить логирование

```typescript
// В консоли браузера
localStorage.setItem('DEBUG_PWA', 'true');
location.reload();

// Выключить
localStorage.removeItem('DEBUG_PWA');
location.reload();
```

### Инспектировать IndexedDB

1. Откройте DevTools (F12)
2. Перейдите в Application → IndexedDB
3. Разверните:
   - `FixPriceDB` → `notifications` (уведомления)
   - `FixPriceSyncDB` → `sync_tasks` (задачи синхронизации)

### Проверить Service Worker

1. DevTools → Application → Service Workers
2. Проверить статус: `activated and running`
3. Смотреть логи в Console

---

## 📚 API Reference

### NotificationService

| Метод | Параметры | Возвращает | Описание |
|-------|-----------|-----------|---------|
| `show()` | title, options | void | Отправить уведомление |
| `requestPermission()` | - | boolean | Запросить разрешение |
| `notifyNewProduct()` | product | void | Уведомление о новом товаре |
| `notifyDiscount()` | discount | void | Уведомление о скидке |
| `notifyOrderStatus()` | order | void | Уведомление о заказе |
| `notifyBonusPoints()` | points, reason | void | Уведомление о бонусах |
| `getAllNotifications()` | - | Promise<Notification[]> | Получить все уведомления |
| `clearNotifications()` | - | void | Очистить уведомления |

### BackgroundSyncService

| Метод | Параметры | Возвращает | Описание |
|-------|-----------|-----------|---------|
| `addTask()` | type, data | Promise<string> | Добавить задачу |
| `syncPendingTasks()` | - | void | Синхронизировать |
| `getSyncStats()` | - | Promise<Stats> | Получить статистику |

---

## 🔄 Auto-Update механизм

### Как работает обновление

1. **Проверка** - каждые 60 секунд Service Worker проверяет обновления
2. **Detect** - если найдено обновление, появляется prompt
3. **Install** - пользователь нажимает "Обновить"
4. **Activate** - новый SW становится активным
5. **Reload** - страница перезагружается с новой версией

### Вручную проверить обновления

```typescript
// Из компонента
const handleCheckForUpdates = async () => {
  const registrations = await navigator.serviceWorker?.getRegistrations() || [];
  for (const reg of registrations) {
    await reg.update();
  }
};
```

---

## 📝 Примеры использования

### Пример 1: Отправить уведомление при добавлении товара в корзину

```typescript
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

const handleAddToCart = async (product: Product) => {
  try {
    addItem(product);
    toast.success('✅ Товар добавлен');

    // Отправить уведомление если пользователь подписан
    if (notificationService.constructor.getPermissionStatus() === 'granted') {
      await notificationService.show(`🛒 ${product.name} добавлена в корзину`, {
        body: `Цена: ${product.basePrice} ₽`,
        icon: product.images?.[0]?.url || '/logo.svg',
        tag: `add_to_cart_${product.id}`,
      });
    }
  } catch (error) {
    toast.error('❌ Ошибка');
  }
};
```

### Пример 2: Синхронизировать отзыв в offline режиме

```typescript
import { backgroundSyncService } from '@/services/backgroundSyncService';
import { notificationService } from '@/services/notificationService';

const handleSubmitReview = async (review: ReviewData) => {
  try {
    if (navigator.onLine) {
      // Отправить сразу
      await api.submitReview(review);
      toast.success('✅ Отзыв опубликован');
    } else {
      // Добавить в очередь
      await backgroundSyncService.addTask('review', review);
      toast.success('💾 Отзыв сохранён, опубликуем при интернете');

      // Уведомление
      await notificationService.show('📝 Отзыв в очереди', {
        body: 'Опубликуется при подключении к интернету',
      });
    }
  } catch (error) {
    toast.error('❌ Ошибка');
  }
};
```

### Пример 3: Полная интеграция уведомлений при покупке

```typescript
import { notificationService } from '@/services/notificationService';
import { backgroundSyncService } from '@/services/backgroundSyncService';

const handleCheckout = async (orderData: OrderData) => {
  const orderId = `ORD_${Date.now()}`;

  try {
    if (navigator.onLine) {
      // Отправить заказ
      const order = await api.createOrder(orderData);

      // Уведомление
      await notificationService.notifyOrderStatus({
        orderId: order.id,
        status: 'confirmed',
      });

      // Бонусы
      const bonusPoints = Math.floor(order.total / 10);
      await notificationService.notifyBonusPoints(
        bonusPoints,
        'За покупку'
      );
    } else {
      // Offline - добавить в синхронизацию
      await backgroundSyncService.addTask('order', {
        ...orderData,
        orderId,
        timestamp: Date.now(),
      });

      // Уведомление
      await notificationService.show('📦 Заказ сохранён', {
        body: 'Отправим при подключении к интернету',
        requireInteraction: true,
      });
    }
  } catch (error) {
    toast.error('❌ Ошибка при оформлении');
  }
};
```

---

## 🎓 Дополнительные ресурсы

- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA на web.dev](https://web.dev/progressive-web-apps/)

---

**Последнее обновление:** 30 января 2026
**Версия:** 1.0 (PWA Notifications Complete)
