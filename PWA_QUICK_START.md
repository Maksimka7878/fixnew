# 🚀 PWA Notifications - Быстрый старт

## Что было реализовано

✅ **Web Push Notifications** - система уведомлений с offline поддержкой
✅ **Notification Center** - UI для управления уведомлениями
✅ **Background Sync** - автосинхронизация при возвращении онлайн
✅ **Auto-Update PWA** - автоматическое обновление приложения
✅ **IndexedDB Storage** - локальное хранилище уведомлений и задач

---

## 🎯 Как начать использовать

### 1️⃣ Включить Notification Center в Header

**Уже сделано в `src/components/layout/Header.tsx`:**
```tsx
import { NotificationCenter } from '@/components/pwa/NotificationCenter';

// В desktop меню:
<NotificationCenter />

// В mobile меню:
<NotificationCenter />
```

✅ Компонент отображается в заголовке с иконкой 🔔

---

### 2️⃣ Отправить первое уведомление

```typescript
import { notificationService } from '@/services/notificationService';

// Где-то в компоненте или API обработчике:
await notificationService.show('Привет! 👋', {
  body: 'Это ваше первое уведомление',
  icon: '/logo.svg',
  badge: '/logo.svg',
});
```

**Результат:** На экране пользователя появится уведомление (если он разрешил)

---

### 3️⃣ Специализированные уведомления

#### 🆕 О новом товаре
```typescript
await notificationService.notifyNewProduct({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image_url,
});
```

#### 🔥 О скидке
```typescript
await notificationService.notifyDiscount({
  title: 'Скидка 50%',
  description: 'На избранные товары',
  discount_percent: 50,
  image: '/promo.jpg',
});
```

#### 📦 О статусе заказа
```typescript
await notificationService.notifyOrderStatus({
  orderId: 'ORD123',
  status: 'shipped', // pending, confirmed, shipped, delivered
  trackingNumber: 'TRACK123',
});
```

#### ⭐ О бонусах
```typescript
await notificationService.notifyBonusPoints(100, 'За покупку');
```

---

### 4️⃣ Offline режим (Background Sync)

```typescript
import { backgroundSyncService } from '@/services/backgroundSyncService';

// Пользователь в offline - добавить задачу
await backgroundSyncService.addTask('order', {
  orderId: '123',
  items: [...],
  total: 999,
});

// При возвращении онлайн - автоматически синхронизируется!
```

---

## 📊 Примеры интеграции

### Пример 1: При добавлении товара в корзину

```typescript
// src/components/product/ProductCard.tsx
const handleAddToCart = async (product: Product) => {
  addToCart(product);

  // Отправить уведомление
  if (notificationService.constructor.getPermissionStatus() === 'granted') {
    await notificationService.show(`🛒 ${product.name} добавлена в корзину`, {
      body: `${product.basePrice} ₽`,
      icon: product.images?.[0]?.url,
      tag: `add_to_cart_${product.id}`,
    });
  }
};
```

### Пример 2: При оформлении заказа

```typescript
// src/pages/cart/CheckoutPage.tsx
const handleSubmit = async () => {
  // ... валидация

  try {
    const order = await api.createOrder(orderData);

    // ✅ Уведомление о подтверждении
    await notificationService.notifyOrderStatus({
      orderId: order.id,
      status: 'confirmed',
    });

    // ⭐ Уведомление о бонусах
    const bonusPoints = Math.floor(order.total / 10);
    await notificationService.notifyBonusPoints(
      bonusPoints,
      'За покупку'
    );

    clearCart();
    navigate('/account/orders');
  } catch (error) {
    // Если offline - добавить в синхронизацию
    if (!navigator.onLine) {
      await backgroundSyncService.addTask('order', {
        ...orderData,
        orderId: `ORD_${Date.now()}`,
      });
    }
    throw error;
  }
};
```

### Пример 3: При добавлении в избранное

```typescript
// src/components/product/ProductCard.tsx
const handleAddToFavorites = async (productId: string) => {
  toggleFavorite(productId);

  // Offline sync
  if (!navigator.onLine) {
    await backgroundSyncService.addTask('favorite', {
      productId,
      action: 'add',
    });
  }
};
```

---

## 🔔 UI Компоненты

### Notification Center (уже в Header)

Пользователь может:
- ✅ Включить/отключить уведомления
- ✅ Тестировать уведомления
- ✅ Смотреть историю (10 последних)
- ✅ Видеть статус соединения (online/offline)
- ✅ Синхронизировать (если offline)

### Update Prompt (автоматическое обновление)

При наличии обновления появляется уведомление:
- "📦 Доступно обновление"
- Кнопка "Обновить" - перезагружает приложение
- Кнопка "Позже" - отложить

---

## 🧪 Тестирование

### Тест 1: Простое уведомление

```typescript
// В консоли браузера:
const { notificationService } = await import('/src/services/notificationService.ts');
await notificationService.requestPermission();
await notificationService.show('Test 🧪', { body: 'Работает!' });
```

### Тест 2: Offline режим

1. Откройте DevTools (F12)
2. Перейдите в Network
3. Найдите "Offline" и нажмите
4. Добавьте товар в корзину
5. Видите в console: `📌 Задача добавлена: sync_...`
6. Вернитесь онлайн (снимите Offline)
7. Видите: `🔄 Синхронизация...`

### Тест 3: История уведомлений

```typescript
// В консоли:
const { notificationService } = await import('/src/services/notificationService.ts');
const notifs = await notificationService.getAllNotifications();
console.table(notifs);
```

---

## 🔧 Troubleshooting

### ❌ Уведомления не работают

**Проверьте:**
1. Разрешили ли уведомления? (Notification Center → Уведомления)
2. Service Worker активен? (DevTools → Application → Service Workers)
3. Консоль браузера на ошибки? (DevTools → Console)

**Решение:**
```typescript
// Проверить статус
const status = notificationService.constructor.getPermissionStatus();
console.log('Статус:', status); // 'granted' | 'denied' | 'default'

// Запросить разрешение
await notificationService.requestPermission();
```

### ❌ Background Sync не работает

**Проверьте:**
1. IndexedDB активна? (DevTools → Application → IndexedDB)
2. Service Worker видит изменения? (Обновите страницу)
3. Вы действительно offline? (DevTools → Network → Offline)

**Решение:**
```typescript
// Смотреть pending tasks
const { backgroundSyncService } = await import('/src/services/backgroundSyncService.ts');
const stats = await backgroundSyncService.getSyncStats();
console.log('Sync stats:', stats);
```

### ❌ Обновление не появляется

**Проверьте:**
1. Есть новая версия? (npm run build)
2. Service Worker обновился? (DevTools → Application → Service Workers → Update)

**Решение:**
```typescript
// Вручную проверить обновления
const registrations = await navigator.serviceWorker?.getRegistrations() || [];
for (const reg of registrations) {
  await reg.update();
}
```

---

## 📁 Структура файлов

```
src/
├── services/
│   ├── notificationService.ts       # 📱 Web Push Notifications
│   └── backgroundSyncService.ts     # 🔄 Background Sync
├── components/pwa/
│   ├── NotificationCenter.tsx       # 🔔 UI для уведомлений
│   ├── UpdatePrompt.tsx             # ♻️ Auto-update prompt
│   └── ... (другие PWA компоненты)
└── layout/
    └── Header.tsx                   # Интегрирована NotificationCenter

public/
├── manifest.json                    # 📋 PWA манифест
└── ... (иконки, скриншоты)
```

---

## 📚 API Quick Reference

### NotificationService

```typescript
// Показать уведомление
await notificationService.show(title, options);

// Запросить разрешение
const granted = await notificationService.requestPermission();

// Специализированные методы
await notificationService.notifyNewProduct({ ... });
await notificationService.notifyDiscount({ ... });
await notificationService.notifyOrderStatus({ ... });
await notificationService.notifyBonusPoints(points, reason);

// История
const notifications = await notificationService.getAllNotifications();
await notificationService.clearNotifications();

// Проверить статус
const status = notificationService.constructor.getPermissionStatus();
const isSupported = notificationService.constructor.isSupported();
```

### BackgroundSyncService

```typescript
// Добавить задачу для синхронизации
const taskId = await backgroundSyncService.addTask(type, data);

// Синхронизировать вручную
await backgroundSyncService.syncPendingTasks();

// Получить статистику
const stats = await backgroundSyncService.getSyncStats();
// { pending: 2, syncing: 0, completed: 5, failed: 1 }
```

---

## 🎓 Дополнительная информация

- **Полное руководство:** [PWA_NOTIFICATIONS_GUIDE.md](./PWA_NOTIFICATIONS_GUIDE.md)
- **SEO & Mobile:** [SEO_AND_MOBILE_OPTIMIZATION.md](./SEO_AND_MOBILE_OPTIMIZATION.md)
- **Платежи:** Implementation plan в корне проекта

---

## ✅ Чек-лист для деплоя

- [ ] Настроить push сервер (Firebase Cloud Messaging или аналог)
- [ ] Добавить иконки в `/public` (icon-192, icon-512, screenshot-mobile)
- [ ] Обновить `SITE_URL` в scripts/generate-sitemap.js
- [ ] Протестировать уведомления на реальном устройстве
- [ ] Проверить offline режим (DevTools → Network → Offline)
- [ ] Убедиться, что Service Worker работает в production
- [ ] Добавить Analytics для отслеживания использования PWA

---

## 🚀 Команды

```bash
# Запустить dev сервер
npm run dev

# Собрать для production (автоматически генерирует PWA)
npm run build

# Preview production build
npm run preview

# Генерировать SEO файлы
npm run generate-seo
```

---

**Версия:** 1.0 (PWA Complete)
**Последнее обновление:** 30 января 2026

🎉 **Готово к использованию!**
