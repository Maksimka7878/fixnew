# Mobile Redesign Plan (Fix Price Style)

The goal is to align the mobile interface with the provided screenshot from [fix-price.com](https://fix-price.com/), creating a premium, app-like experience.

## User Review Required
> [!IMPORTANT]
> This redesign implies significant layout changes for mobile. The desktop view will be largely preserved but adapted to shared components.

## Proposed Changes

### 1. Global Styling & Foundation
- **Colors**: Update primary green to match Fix Price exact shade (`#43b02a`).
- **Typography**: Ensure fonts are legible and match the premium rounded aesthetic.
- **Micro-animations**: Add `framer-motion` touch feedback to all interactive elements.

### 2. Mobile Header Redesign
Refactor `Header.tsx` to match the screenshot:
- **Smart App Banner**: Style `PWAInstallPrompt` (or create a new banner) to look like the "Install in App Store" top bar.
- **Top Bar Layout**:
  - **Left**: Hamburger Menu (opens generic sidebar).
  - **Center**: "Delivery or Pickup" green pill button.
  - **Right**: Search Icon & Bookmark/Heart Icon.
- **Mobile Menu**: Ensure the existing drawer works with the new trigger.

### 3. Bottom Navigation Bar (New)
Create a new `BottomNav.tsx` component visible only on mobile:
- **Fixed Position**: Sticky at bottom.
- **5 Items**:
  1. **Home** (Active state: Green pill background)
  2. **Catalog**
  3. **Cart**
  4. **Stores** (Map/Pin)
  5. **Profile**
- **Integration**: Add to `MainLayout.tsx` and hide the standard Footer on mobile.

### 4. Home Page (`HomePage.tsx`)
Restructure content to match the reference:
- **Horizontal Tags**: Scrollable row (e.g., "Gifts", "Sale", "New").
- **Hero Banners**: Large, rounded carousel with "dots" pagination.
- **Navigation Blocks**:
  - "Catalog of Goods" (White card, full width/large).
  - "More profitable with authorization" (Green card, promo).
- **Product Rails**: Horizontal scrolling lists ("Popular", "Recommendations") instead of simple grids.

### 5. Catalog & Menu
- **Burger Menu**: Update content to match the site structure if needed.

## Phased Execution
1.  **Setup**: Colors, reusable UI components (HorizontalScroll, IconWrapper).
2.  **Navigation**: Implement `BottomNav` and update `Header`.
3.  **Home Content**: Rebuild `HomePage` sections.
4.  **Polish**: Animations and final alignment.
