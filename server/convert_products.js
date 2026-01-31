
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

function getCategoryFromUrl(url) {
    if (!url) return DEFAULT_CAT;
    try {
        const parts = url.split('/catalog/');
        if (parts.length > 1) {
            const slug = parts[1].split('/')[0];
            return CATEGORY_MAP[slug] || DEFAULT_CAT;
        }
    } catch (e) { }
    return DEFAULT_CAT;
}

function convert() {
    console.log('Reading JSON...');
    const rawData = fs.readFileSync(JSON_FILE, 'utf-8');
    const items = JSON.parse(rawData);
    console.log(`Found ${items.length} items`);

    const newProducts = items.map((item, index) => {
        const catId = getCategoryFromUrl(item.sourceUrl);
        const imgUrl = item.images && item.images.length > 0 ? item.images[0] : '';

        // Generate a valid Product object as string
        return `    {
        id: '${item.sourceId || 'gen-' + index}',
        name: ${JSON.stringify(item.title)},
        slug: 'p-${item.sourceId || index}',
        basePrice: ${item.price || 0},
        baseOldPrice: ${item.oldPrice || 'undefined'},
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
        description: ${JSON.stringify(item.description || '')},
        inStock: ${item.inStock}
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
