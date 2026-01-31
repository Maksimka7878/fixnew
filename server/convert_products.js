
const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, 'products_autosave.json');
const TS_FILE = path.join(__dirname, '../src/api/mock/data/products.ts');

const CATEGORY_MAP = {
    'produkty-i-napitki': 'c1',
    'bytovaya-khimiya': 'c2',
    'kosmetika-i-gigiena': 'c3',
    'dlya-doma': 'c4',
    'sad-i-ogorod': 'c4',
    'igrushki': 'c5',
    'odezhda': 'c6',
    'kantselyariya': 'c7',
    'remont': 'c4',
    'avto-i-moto': 'c4',
    'elektronika': 'c4',
    'sport-i-otdykh': 'c5',
    'tovary-dlya-zhivotnykh': 'c4',
    'knigi': 'c7',
    'prazdniki': 'c4',
    'aksessuary': 'c6'
};

const DEFAULT_CAT = 'c4';

function getCategory(item) {
    // 1. Try URL mapping first
    let catId = DEFAULT_CAT;
    if (item.sourceUrl) {
        try {
            const parts = item.sourceUrl.split('/catalog/');
            if (parts.length > 1) {
                const slug = parts[1].split('/')[0];
                if (CATEGORY_MAP[slug]) {
                    catId = CATEGORY_MAP[slug];
                }
            }
        } catch (e) { }
    }

    // 2. If it's the default 'c4' (Home), try to refine using Title keywords
    if (catId === 'c4') {
        const title = (item.title || '').toLowerCase();

        // C1: Food
        if (title.match(/чай|кофе|конфеты|печенье|шоколад|вода|напиток|сок|чипсы|сухарики|макароны|крупа|масло|консервы/)) return 'c1';

        // C2: Chemicals
        if (title.match(/domestos|fairy|persil|tide|ariel|стиральный|порошок|гель для стирки|кондиционер для белья|средство для|чистящее|отбеливатель|пятновыводитель|антижир/)) return 'c2';

        // C3: Cosmetics & Hygiene
        if (title.match(/крем|шампунь|мыло|гель для душа|скраб|маска|зубная|ватные|прокладки|памперсы|дезодорант|бальзам|лосьон/)) return 'c3';

        // C5: Toys
        if (title.match(/игрушка|кукла|машинка|конструктор|пазл|мяч|настольная игра|игровой|для детей/)) return 'c5';

        // C6: Textile
        if (title.match(/полотенце|плед|подушка|носки|трусы|футболка|колготки|наволочка|простыня|одеяло|шторы|скатерть/)) return 'c6';

        // C7: Stationery
        if (title.match(/ручка|карандаш|тетрадь|блокнот|клей|фломастер|маркер|скотч|бумага а4|папка|ластик|точилка/)) return 'c7';
    }

    return catId;
}

function convert() {
    console.log('Reading JSON...');
    const rawData = fs.readFileSync(JSON_FILE, 'utf-8');
    const items = JSON.parse(rawData);
    console.log(`Found ${items.length} items`);

    const newProducts = items.map((item, index) => {
        const catId = getCategory(item);
        const imgUrl = item.images && item.images.length > 0 ? item.images[0] : '';

        // Clean up price (remove non-digits if string, or keep number)
        let price = item.price;
        if (typeof price === 'string') price = parseFloat(price.replace(/[^\d.]/g, ''));
        if (!price) price = 0;

        let oldPrice = item.oldPrice;
        if (typeof oldPrice === 'string') oldPrice = parseFloat(oldPrice.replace(/[^\d.]/g, ''));

        return `    {
        id: '${item.sourceId || 'gen-' + index}',
        name: ${JSON.stringify(item.title)},
        slug: 'p-${item.sourceId || index}',
        basePrice: ${price},
        baseOldPrice: ${oldPrice || 'undefined'},
        images: [
            { id: 'img-${item.sourceId}-1', url: '${imgUrl}', thumbnailUrl: '${imgUrl}', alt: ${JSON.stringify(item.title)}, sortOrder: 0 }
        ],
        categoryId: '${catId}',
        category: cat('${catId}'),
        barcode: '${4600000000000 + index}',
        sku: 'SKU-${item.sourceId || index}',
        specifications: [],
        tags: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: ${JSON.stringify(item.description || 'Описание товара')},
        inStock: ${item.inStock !== false}
    }`;
    });

    console.log('Reading TS file...');
    let tsContent = fs.readFileSync(TS_FILE, 'utf-8');

    // Find where PRODUCTS starts
    const marker = 'export const PRODUCTS: Product[] = [';
    const splitIdx = tsContent.indexOf(marker);

    if (splitIdx === -1) {
        console.error('Could not find PRODUCTS array in TS file');
        process.exit(1);
    }

    // Keep header
    const header = tsContent.substring(0, splitIdx + marker.length);

    // Construct new file content
    const newContent = header + '\n' + newProducts.join(',\n') + '\n];\n';

    fs.writeFileSync(TS_FILE, newContent, 'utf-8');
    console.log(`Updated ${TS_FILE} with ${newProducts.length} products.`);
}

convert();
