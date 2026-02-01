import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'cart' | 'orders' | 'favorites' | 'search' | 'generic';
}

const emptyIcons: Record<string, string> = {
  cart: '🛒',
  orders: '📦',
  favorites: '❤️',
  search: '🔍',
  generic: '✨'
};

const emptyMessages: Record<string, { defaultTitle: string; defaultDesc: string }> = {
  cart: {
    defaultTitle: 'Корзина пуста',
    defaultDesc: 'Добавьте товары в корзину, чтобы начать покупки'
  },
  orders: {
    defaultTitle: 'Заказов нет',
    defaultDesc: 'Вы еще не совершили ни одного заказа'
  },
  favorites: {
    defaultTitle: 'Избранное пусто',
    defaultDesc: 'Добавьте понравившиеся товары в избранное'
  },
  search: {
    defaultTitle: 'Ничего не найдено',
    defaultDesc: 'Попробуйте другой поисковый запрос или фильтры'
  },
  generic: {
    defaultTitle: 'Нет данных',
    defaultDesc: 'Здесь пока ничего нет'
  }
};

/**
 * EmptyState Component
 *
 * Friendly empty state for all collections and lists.
 * Provides context-specific messages and calls-to-action.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  type = 'generic'
}: EmptyStateProps) {
  const messages = emptyMessages[type] || emptyMessages.generic;
  const displayIcon = icon || emptyIcons[type];
  const displayTitle = title || messages.defaultTitle;
  const displayDescription = description || messages.defaultDesc;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl mb-4"
      >
        {displayIcon}
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p className="text-gray-600 max-w-sm mb-6">
          {displayDescription}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-6 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Empty State Variants for specific use cases
 */

export function CartEmpty({ onContinueShopping }: { onContinueShopping: () => void }) {
  return (
    <EmptyState
      type="cart"
      action={{
        label: 'Перейти в каталог',
        onClick: onContinueShopping
      }}
    />
  );
}

export function OrdersEmpty({ onStartShopping }: { onStartShopping: () => void }) {
  return (
    <EmptyState
      type="orders"
      action={{
        label: 'Начать покупки',
        onClick: onStartShopping
      }}
    />
  );
}

export function FavoritesEmpty({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      type="favorites"
      action={{
        label: 'Посмотреть товары',
        onClick: onBrowse
      }}
    />
  );
}

export function SearchEmpty({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      type="search"
      action={{
        label: 'Очистить поиск',
        onClick: onReset
      }}
    />
  );
}
