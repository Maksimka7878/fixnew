const fs = require('fs');
const { runScraper } = require('./scraper');

const TARGET = 600;
const OUTPUT_FILE = './products_600.json';
const AUTOSAVE_FILE = './products_autosave.json';

// Load existing products to skip duplicates
let existing = [];
for (const f of [OUTPUT_FILE, AUTOSAVE_FILE]) {
    if (fs.existsSync(f)) {
        try {
            existing = JSON.parse(fs.readFileSync(f, 'utf-8'));
            console.log(`📦 Загружено ${existing.length} существующих товаров из ${f}`);
            break;
        } catch (_) {}
    }
}

let lastLog = Date.now();

runScraper({
    categoriesLimit: 50,
    productsPerCategory: 200,
    maxPagesPerCategory: 8,
    autoSaveEvery: 10,
    autoSavePath: AUTOSAVE_FILE,
    existingProducts: existing,
    onProgress: (p) => {
        // Log progress every 5 seconds max
        if (Date.now() - lastLog > 5000 || p.phase === 'cloudflare' || p.phase === 'categories') {
            console.log(`[${new Date().toLocaleTimeString()}] ${p.phase} | ${p.category || p.message || ''} | найдено: ${p.found || 0}`);
            lastLog = Date.now();
        }
    },
}).then(products => {
    console.log(`\n========================================`);
    console.log(`ИТОГО: ${products.length} товаров`);
    console.log(`========================================`);

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`Сохранено в ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1)} MB)`);

    // Stats
    const withPrice = products.filter(p => p.price > 0);
    const withOldPrice = products.filter(p => p.oldPrice);
    const withImages = products.filter(p => p.images.length > 0);
    const avgPrice = withPrice.reduce((s, p) => s + p.price, 0) / withPrice.length;

    console.log(`\nСтатистика:`);
    console.log(`  С ценой: ${withPrice.length}`);
    console.log(`  Со скидкой: ${withOldPrice.length}`);
    console.log(`  С картинкой: ${withImages.length}`);
    console.log(`  Средняя цена: ${avgPrice.toFixed(0)}₽`);

}).catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
