/**
 * Accessibility (a11y) utilities for WCAG 2.1 AA compliance
 */

// ARIA labels for common elements
export const a11yLabels = {
  // Navigation
  mainNav: { 'aria-label': 'Главное меню' },
  breadcrumb: { 'aria-label': 'Навигация по сайту' },
  mobileNav: { 'aria-label': 'Мобильное меню' },

  // Buttons
  closeButton: { 'aria-label': 'Закрыть' },
  openMenu: { 'aria-label': 'Открыть меню' },
  addToCart: { 'aria-label': 'Добавить в корзину' },
  addToFavorites: { 'aria-label': 'Добавить в избранное' },
  search: { 'aria-label': 'Поиск товаров' },

  // Forms
  loginForm: { 'aria-label': 'Форма входа' },
  searchForm: { 'aria-label': 'Форма поиска' },
  filterForm: { 'aria-label': 'Фильтры товаров' },

  // Regional landmarks
  main: { role: 'main', 'aria-label': 'Основной контент' },
  contentInfo: { role: 'contentinfo', 'aria-label': 'Информация о сайте' },
  banner: { role: 'banner', 'aria-label': 'Заголовок страницы' },
};

// Skip links for keyboard navigation
export const skipLinkStyles = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: white;
    padding: 8px;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
`;

// Common accessibility classes
export const a11yClasses = {
  srOnly: 'sr-only', // Screen reader only (already in Tailwind)
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none',
  ariaHidden: { 'aria-hidden': 'true' },
};

// Helper functions
export function getAriaLabel(key: keyof typeof a11yLabels) {
  return a11yLabels[key];
}

export function makeAccessibleButton(onClick: () => void, ariaLabel: string) {
  return {
    onClick,
    'aria-label': ariaLabel,
    role: 'button',
    tabIndex: 0,
  };
}

export function makeAccessibleLink(
  href: string,
  label: string,
  title?: string
) {
  return {
    href,
    'aria-label': label,
    title: title || label,
  };
}
