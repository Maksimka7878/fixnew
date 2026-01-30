import type { Product, Category } from '@/types';

// Categories for reference
export const CATEGORIES: Category[] = [
    { id: 'c1', name: 'Продукты', slug: 'produkty', parentId: null, children: [], sortOrder: 1, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/22c55e/white?text=Продукты', icon: 'Apple' },
    { id: 'c2', name: 'Бытовая химия', slug: 'bytovaya-khimiya', parentId: null, children: [], sortOrder: 2, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/3b82f6/white?text=Химия', icon: 'Spray' },
    { id: 'c3', name: 'Косметика', slug: 'kosmetika', parentId: null, children: [], sortOrder: 3, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/ec4899/white?text=Косметика', icon: 'Sparkles' },
    { id: 'c4', name: 'Дом и сад', slug: 'dom-i-sad', parentId: null, children: [], sortOrder: 4, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/f59e0b/white?text=Дом', icon: 'Home' },
    { id: 'c5', name: 'Игрушки', slug: 'igrushki', parentId: null, children: [], sortOrder: 5, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/8b5cf6/white?text=Игрушки', icon: 'Gamepad' },
    { id: 'c6', name: 'Текстиль', slug: 'tekstil', parentId: null, children: [], sortOrder: 6, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/06b6d4/white?text=Текстиль', icon: 'Shirt' },
    { id: 'c7', name: 'Канцтовары', slug: 'kantstovary', parentId: null, children: [], sortOrder: 7, isActive: true, regionIds: ['r1', 'r2', 'r3'], image: 'https://placehold.co/400x400/ef4444/white?text=Канцтовары', icon: 'Pencil' },
];

const cat = (id: string) => CATEGORIES.find(c => c.id === id)!;

const img = (text: string, color: string = '43b02a') => ({
    id: `img-${Math.random().toString(36).substring(2, 8)}`,
    url: `https://placehold.co/400x400/${color}/white?text=${encodeURIComponent(text)}`,
    thumbnailUrl: `https://placehold.co/100x100/${color}/white?text=${encodeURIComponent(text)}`,
    alt: text,
    sortOrder: 1,
});

// Generate products with variations
export const PRODUCTS: Product[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // ПРОДУКТЫ (Food & Drinks) - c1
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p1', name: 'Молоко 3.2% 1л', slug: 'moloko-3-2-1l', basePrice: 89, baseOldPrice: 109, images: [img('Молоко', '22c55e')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567890', sku: 'MILK-001', specifications: [], tags: ['dairy'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p2', name: 'Хлеб Бородинский 400г', slug: 'khleb-borodinskiy', basePrice: 45, images: [img('Хлеб', '8B4513')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567891', sku: 'BREAD-001', specifications: [], tags: ['bakery'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p3', name: 'Coca-Cola 1.5л', slug: 'coca-cola-1-5l', basePrice: 129, baseOldPrice: 149, images: [img('Cola', 'DC143C')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567892', sku: 'COLA-001', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p4', name: 'Чипсы Lay\'s 150г', slug: 'chipsy-lays', basePrice: 149, images: [img('Чипсы', 'FFD700')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567893', sku: 'CHIPS-001', specifications: [], tags: ['snacks'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p5', name: 'Шоколад Milka 100г', slug: 'shokolad-milka', basePrice: 119, baseOldPrice: 139, images: [img('Milka', '9370DB')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567894', sku: 'CHOCO-001', specifications: [], tags: ['sweets'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 99 },
    { id: 'p6', name: 'Сок яблочный 1л', slug: 'sok-yablochnyy', basePrice: 99, images: [img('Сок', 'FFA500')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567895', sku: 'JUICE-001', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p7', name: 'Печенье Oreo 176г', slug: 'pechenie-oreo', basePrice: 159, images: [img('Oreo', '333333')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567896', sku: 'COOKIE-001', specifications: [], tags: ['sweets'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p8', name: 'Йогурт клубничный 250г', slug: 'yogurt-klubnichnyy', basePrice: 69, images: [img('Йогурт', 'FF69B4')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567897', sku: 'YOGURT-001', specifications: [], tags: ['dairy'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 59 },
    { id: 'p9', name: 'Масло сливочное 200г', slug: 'maslo-slivochnoe', basePrice: 199, baseOldPrice: 249, images: [img('Масло', 'FFD700')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567898', sku: 'BUTTER-001', specifications: [], tags: ['dairy'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p10', name: 'Конфеты Raffaello 150г', slug: 'konfety-raffaello', basePrice: 299, baseOldPrice: 349, images: [img('Raffaello', 'FFF5EE')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567899', sku: 'CANDY-001', specifications: [], tags: ['sweets'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    // More food items
    { id: 'p11', name: 'Вода минеральная 1.5л', slug: 'voda-mineralnaya', basePrice: 49, images: [img('Вода', '87CEEB')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567900', sku: 'WATER-001', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p12', name: 'Кофе растворимый 95г', slug: 'kofe-rastvorimyy', basePrice: 299, images: [img('Кофе', '4A3728')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567901', sku: 'COFFEE-001', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p13', name: 'Чай черный 100 пак', slug: 'chay-chernyy', basePrice: 189, images: [img('Чай', '8B4513')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567902', sku: 'TEA-001', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p14', name: 'Макароны 500г', slug: 'makarony', basePrice: 79, images: [img('Макароны', 'F5DEB3')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567903', sku: 'PASTA-001', specifications: [], tags: ['groceries'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p15', name: 'Рис длиннозерный 1кг', slug: 'ris-dlinnozernyy', basePrice: 129, images: [img('Рис', 'FFFACD')], categoryId: 'c1', category: cat('c1'), barcode: '4601234567904', sku: 'RICE-001', specifications: [], tags: ['groceries'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 109 },

    // ═══════════════════════════════════════════════════════════════════════════
    // БЫТОВАЯ ХИМИЯ (Household) - c2
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p16', name: 'Tide 3кг', slug: 'tide-3kg', basePrice: 599, images: [img('Tide', 'FFA500')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568000', sku: 'TIDE-001', specifications: [], tags: ['laundry'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p17', name: 'Fairy 500мл', slug: 'fairy-500ml', basePrice: 149, baseOldPrice: 179, images: [img('Fairy', '32CD32')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568001', sku: 'FAIRY-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p18', name: 'Domestos 1л', slug: 'domestos-1l', basePrice: 199, images: [img('Domestos', '4169E1')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568002', sku: 'DOMESTOS-001', specifications: [], tags: ['cleaning'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p19', name: 'Мешки для мусора 30шт', slug: 'meshki-dlya-musora', basePrice: 89, images: [img('Мешки', '333333')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568003', sku: 'BAGS-001', specifications: [], tags: ['household'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p20', name: 'Губки для посуды 5шт', slug: 'gubki-dlya-posudy', basePrice: 59, images: [img('Губки', 'FFD700')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568004', sku: 'SPONGE-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p21', name: 'Стеклоочиститель 500мл', slug: 'stekloochistitel', basePrice: 129, images: [img('Стекло', '87CEEB')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568005', sku: 'GLASS-001', specifications: [], tags: ['cleaning'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 99 },
    { id: 'p22', name: 'Освежитель воздуха', slug: 'osvezhitel-vozdukha', basePrice: 179, images: [img('Освежитель', 'DDA0DD')], categoryId: 'c2', category: cat('c2'), barcode: '4601234568006', sku: 'FRESHER-001', specifications: [], tags: ['household'], isActive: true, createdAt: '', updatedAt: '' },

    // ═══════════════════════════════════════════════════════════════════════════
    // КОСМЕТИКА (Beauty & Health) - c3
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p23', name: 'Head & Shoulders 400мл', slug: 'head-shoulders', basePrice: 349, baseOldPrice: 399, images: [img('Shampoo', '4169E1')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569000', sku: 'SHAMPOO-001', specifications: [], tags: ['hair'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p24', name: 'Крем для рук 75мл', slug: 'krem-dlya-ruk', basePrice: 129, images: [img('Крем', 'FFB6C1')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569001', sku: 'CREAM-001', specifications: [], tags: ['skincare'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p25', name: 'Зубная паста 100мл', slug: 'zubnaya-pasta', basePrice: 89, images: [img('Паста', 'FFFFFF')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569002', sku: 'PASTE-001', specifications: [], tags: ['hygiene'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p26', name: 'Дезодорант 150мл', slug: 'dezodorant', basePrice: 199, baseOldPrice: 249, images: [img('Дезодорант', '87CEEB')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569003', sku: 'DEO-001', specifications: [], tags: ['hygiene'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p27', name: 'Гель для душа 250мл', slug: 'gel-dlya-dusha', basePrice: 149, images: [img('Гель', 'ADD8E6')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569004', sku: 'GEL-001', specifications: [], tags: ['hygiene'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 129 },
    { id: 'p28', name: 'Мыло жидкое 300мл', slug: 'mylo-zhidkoe', basePrice: 99, images: [img('Мыло', 'FFE4E1')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569005', sku: 'SOAP-001', specifications: [], tags: ['hygiene'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p29', name: 'Влажные салфетки 100шт', slug: 'vlazhnye-salfetki', basePrice: 159, images: [img('Салфетки', 'E6E6FA')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569006', sku: 'WIPES-001', specifications: [], tags: ['hygiene'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p30', name: 'Маска для лица', slug: 'maska-dlya-litsa', basePrice: 79, images: [img('Маска', 'FFC0CB')], categoryId: 'c3', category: cat('c3'), barcode: '4601234569007', sku: 'MASK-001', specifications: [], tags: ['skincare'], isActive: true, createdAt: '', updatedAt: '' },

    // ═══════════════════════════════════════════════════════════════════════════
    // ДОМ И САД (Home & Garden) - c4
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p31', name: 'Тарелка керамическая', slug: 'tarelka-keramicheskaya', basePrice: 159, images: [img('Тарелка', 'F5F5DC')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570000', sku: 'PLATE-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p32', name: 'Кружка 350мл', slug: 'kruzhka-350ml', basePrice: 129, images: [img('Кружка', 'F0F8FF')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570001', sku: 'MUG-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p33', name: 'Ваза стеклянная', slug: 'vaza-steklyannaya', basePrice: 299, baseOldPrice: 399, images: [img('Ваза', '87CEEB')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570002', sku: 'VASE-001', specifications: [], tags: ['decor'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p34', name: 'Свечи декоративные 6шт', slug: 'svechi-dekorativnye', basePrice: 199, images: [img('Свечи', 'FFF8DC')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570003', sku: 'CANDLE-001', specifications: [], tags: ['decor'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p35', name: 'Кашпо для цветов', slug: 'kashpo-dlya-tsvetov', basePrice: 249, images: [img('Кашпо', 'DEB887')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570004', sku: 'POT-001', specifications: [], tags: ['garden'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 199 },
    { id: 'p36', name: 'Контейнер пищевой 1л', slug: 'konteyner-pishchevoy', basePrice: 179, images: [img('Контейнер', '87CEEB')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570005', sku: 'CONTAINER-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p37', name: 'Полотенце кухонное', slug: 'polotentse-kukhonnoe', basePrice: 99, images: [img('Полотенце', 'FFB6C1')], categoryId: 'c4', category: cat('c4'), barcode: '4601234570006', sku: 'TOWEL-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '' },

    // ═══════════════════════════════════════════════════════════════════════════
    // ИГРУШКИ (Toys) - c5
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p38', name: 'Конструктор 100 деталей', slug: 'konstruktor-100', basePrice: 499, baseOldPrice: 699, images: [img('Конструктор', 'FFD700')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571000', sku: 'LEGO-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p39', name: 'Мягкая игрушка Мишка', slug: 'myagkaya-igrushka-mishka', basePrice: 399, images: [img('Мишка', 'DEB887')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571001', sku: 'BEAR-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p40', name: 'Пазл 500 элементов', slug: 'pazl-500', basePrice: 349, images: [img('Пазл', '9370DB')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571002', sku: 'PUZZLE-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p41', name: 'Машинка металлическая', slug: 'mashinka-metallicheskaya', basePrice: 199, images: [img('Машинка', 'DC143C')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571003', sku: 'CAR-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 179 },
    { id: 'p42', name: 'Кукла в платье', slug: 'kukla-v-platie', basePrice: 599, images: [img('Кукла', 'FF69B4')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571004', sku: 'DOLL-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p43', name: 'Настольная игра', slug: 'nastolnaya-igra', basePrice: 799, baseOldPrice: 999, images: [img('Игра', '32CD32')], categoryId: 'c5', category: cat('c5'), barcode: '4601234571005', sku: 'GAME-001', specifications: [], tags: ['toys'], isActive: true, createdAt: '', updatedAt: '', isNew: true },

    // ═══════════════════════════════════════════════════════════════════════════
    // ТЕКСТИЛЬ (Textiles) - c6
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p44', name: 'Полотенце банное', slug: 'polotentse-bannoe', basePrice: 399, images: [img('Полотенце', '87CEEB')], categoryId: 'c6', category: cat('c6'), barcode: '4601234572000', sku: 'BATH-001', specifications: [], tags: ['textile'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p45', name: 'Покрывало 150x200', slug: 'pokryvalo', basePrice: 899, baseOldPrice: 1199, images: [img('Покрывало', 'DDA0DD')], categoryId: 'c6', category: cat('c6'), barcode: '4601234572001', sku: 'BLANKET-001', specifications: [], tags: ['textile'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p46', name: 'Подушка декоративная', slug: 'podushka-dekorativnaya', basePrice: 499, images: [img('Подушка', 'FFE4E1')], categoryId: 'c6', category: cat('c6'), barcode: '4601234572002', sku: 'PILLOW-001', specifications: [], tags: ['textile'], isActive: true, createdAt: '', updatedAt: '', isNew: true },
    { id: 'p47', name: 'Носки детские 3 пары', slug: 'noski-detskie', basePrice: 199, images: [img('Носки', 'FFD700')], categoryId: 'c6', category: cat('c6'), barcode: '4601234572003', sku: 'SOCKS-001', specifications: [], tags: ['textile'], isActive: true, createdAt: '', updatedAt: '' },

    // ═══════════════════════════════════════════════════════════════════════════
    // КАНЦТОВАРЫ (Stationery) - c7
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'p48', name: 'Тетрадь 48 листов', slug: 'tetrad-48', basePrice: 49, images: [img('Тетрадь', '87CEEB')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573000', sku: 'NOTEBOOK-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p49', name: 'Ручки шариковые 10шт', slug: 'ruchki-sharikovye', basePrice: 99, images: [img('Ручки', '4169E1')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573001', sku: 'PENS-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '', isBestseller: true },
    { id: 'p50', name: 'Карандаши цветные 24шт', slug: 'karandashi-tsvetnye', basePrice: 249, images: [img('Карандаши', 'FFD700')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573002', sku: 'PENCILS-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p51', name: 'Клей-карандаш', slug: 'kley-karandash', basePrice: 79, images: [img('Клей', 'F5F5DC')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573003', sku: 'GLUE-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p52', name: 'Ножницы канцелярские', slug: 'nozhnitsy', basePrice: 129, images: [img('Ножницы', 'C0C0C0')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573004', sku: 'SCISSORS-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '', cardPrice: 99 },
    { id: 'p53', name: 'Степлер настольный', slug: 'stepler', basePrice: 199, images: [img('Степлер', '333333')], categoryId: 'c7', category: cat('c7'), barcode: '4601234573005', sku: 'STAPLER-001', specifications: [], tags: ['stationery'], isActive: true, createdAt: '', updatedAt: '' },

    // Out of Stock examples
    { id: 'p54', name: 'Чай зеленый премиум', slug: 'chay-zelenyy-premium', basePrice: 349, images: [img('Чай зел', '32CD32')], categoryId: 'c1', category: cat('c1'), barcode: '4601234573006', sku: 'TEA-002', specifications: [], tags: ['drinks'], isActive: true, createdAt: '', updatedAt: '', outOfStock: true },
    { id: 'p55', name: 'Набор посуды 12 пред', slug: 'nabor-posudy', basePrice: 1999, baseOldPrice: 2499, images: [img('Посуда', 'F5F5DC')], categoryId: 'c4', category: cat('c4'), barcode: '4601234573007', sku: 'DISHES-001', specifications: [], tags: ['kitchen'], isActive: true, createdAt: '', updatedAt: '', outOfStock: true },
];
