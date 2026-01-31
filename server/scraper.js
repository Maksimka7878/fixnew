/**
 * Fix Price Scraper with Cloudflare Bypass
 * Uses puppeteer-extra + stealth plugin to pass CF challenges.
 * Parses product cards from category pages (Nuxt SSR rendered HTML).
 */

const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteerExtra.use(StealthPlugin());

const BASE_URL = 'https://fix-price.com';
const CATALOG_URL = 'https://fix-price.com/catalog';
const DEFAULT_CITY = '0000073738'; // Moscow

const MOCK_PRODUCTS = [
    { sourceId: 'mock-1', title: 'Набор посуды 6 предметов', price: 199, oldPrice: 299, description: 'Практичный набор посуды для кухни', images: ['https://via.placeholder.com/400x400/43b02a/fff?text=Посуда'], specs: [], inStock: true },
    { sourceId: 'mock-2', title: 'Шампунь для волос 500мл', price: 89, oldPrice: null, description: 'Мягкий шампунь для ежедневного использования', images: ['https://via.placeholder.com/400x400/2196f3/fff?text=Шампунь'], specs: [], inStock: true },
    { sourceId: 'mock-3', title: 'Свечи ароматические 3шт', price: 149, oldPrice: 199, description: 'Набор ароматических свечей для уютного вечера', images: ['https://via.placeholder.com/400x400/ff9800/fff?text=Свечи'], specs: [], inStock: true },
    { sourceId: 'mock-4', title: 'Рамка для фото 10x15', price: 59, oldPrice: null, description: 'Стильная рамка для ваших любимых фотографий', images: ['https://via.placeholder.com/400x400/9c27b0/fff?text=Рамка'], specs: [], inStock: true },
    { sourceId: 'mock-5', title: 'Губка для мытья посуды 5шт', price: 49, oldPrice: null, description: 'Качественные губки для кухни', images: ['https://via.placeholder.com/400x400/4caf50/fff?text=Губки'], specs: [], inStock: true },
    { sourceId: 'mock-6', title: 'Канцелярский набор', price: 129, oldPrice: 179, description: 'Всё необходимое для офиса и учёбы', images: ['https://via.placeholder.com/400x400/e91e63/fff?text=Канцелярия'], specs: [], inStock: true },
    { sourceId: 'mock-7', title: 'Декоративный цветок', price: 99, oldPrice: null, description: 'Искусственный цветок для украшения интерьера', images: ['https://via.placeholder.com/400x400/8bc34a/fff?text=Цветок'], specs: [], inStock: true },
    { sourceId: 'mock-8', title: 'Контейнер для хранения 1л', price: 79, oldPrice: null, description: 'Герметичный контейнер для продуктов', images: ['https://via.placeholder.com/400x400/00bcd4/fff?text=Контейнер'], specs: [], inStock: true },
    { sourceId: 'mock-9', title: 'Полотенце кухонное 2шт', price: 69, oldPrice: 89, description: 'Мягкие кухонные полотенца', images: ['https://via.placeholder.com/400x400/ff5722/fff?text=Полотенце'], specs: [], inStock: true },
    { sourceId: 'mock-10', title: 'Пакеты для мусора 30шт', price: 39, oldPrice: null, description: 'Прочные мусорные пакеты', images: ['https://via.placeholder.com/400x400/607d8b/fff?text=Пакеты'], specs: [], inStock: true },
];

function delay(min = 1000, max = 3000) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(r => setTimeout(r, ms));
}

function parsePrice(text) {
    if (!text) return null;
    const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

async function initBrowser() {
    return await puppeteerExtra.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080',
            '--lang=ru-RU,ru',
        ],
        defaultViewport: { width: 1920, height: 1080 },
    });
}

async function createPage(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
    });
    await page.setCookie({ name: 'city', value: DEFAULT_CITY, domain: '.fix-price.com' });
    return page;
}

async function waitForCloudflare(page, timeout = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const title = await page.title();
        if (
            title.includes('Just a moment') ||
            title.includes('Checking your browser') ||
            title.includes('Attention Required') ||
            title.includes('Please Wait')
        ) {
            console.log('   ⏳ Cloudflare challenge, ждём...');
            await delay(2000, 4000);
            continue;
        }
        const hasCf = await page.evaluate(() => {
            return !!document.querySelector('#challenge-running, #challenge-stage, .cf-browser-verification');
        });
        if (!hasCf) {
            console.log('   ✅ Cloudflare passed');
            return true;
        }
        await delay(1000, 2000);
    }
    console.log('   ⚠️ Cloudflare timeout');
    return false;
}

async function navigateTo(page, url, waitSelector = null) {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (err) {
        // Retry on navigation errors (detached frame, timeout)
        console.log(`   ⚠️ Retry navigation: ${err.message.substring(0, 50)}`);
        await delay(2000, 3000);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await waitForCloudflare(page);
    if (waitSelector) {
        await page.waitForSelector(waitSelector, { timeout: 15000 }).catch(() => {});
    }
    // Wait for Vue/Nuxt hydration
    await delay(2000, 3000);
    return await page.content();
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight || totalHeight > 8000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 150);
        });
    });
    await delay(500, 1000);
}

/**
 * Get ALL leaf categories by visiting each top-level category page
 * and extracting subcategories from __NUXT__.data.
 * Top-level categories show subcategory tiles, not products.
 * Only leaf categories (level 2+) have actual product cards.
 */
async function getCategories(page) {
    console.log('📂 Получение категорий...');
    await navigateTo(page, CATALOG_URL, 'a[href*="/catalog/"]');

    // Step 1: Get top-level categories from HTML
    const html = await page.content();
    const $ = cheerio.load(html);
    const topLevelCategories = [];
    const seen = new Set();

    $('a[href*="/catalog/"]').each((_, el) => {
        const href = $(el).attr('href');
        const name = $(el).text().trim();
        if (!href || !name) return;
        const path = (href.startsWith('http') ? new URL(href).pathname : href);
        const segments = path.split('/').filter(Boolean);
        // Top-level: /catalog/something (2 segments)
        if (segments.length === 2 && segments[0] === 'catalog' && !seen.has(segments[1])) {
            seen.add(segments[1]);
            topLevelCategories.push({
                name,
                slug: segments[1],
                url: BASE_URL + path,
            });
        }
    });

    console.log(`   Найдено top-level: ${topLevelCategories.length}`);

    // Step 2: Visit each top-level category to extract subcategories from __NUXT__
    const leafCategories = [];

    for (const topCat of topLevelCategories) {
        try {
            await navigateTo(page, topCat.url, '.product, a[href*="/catalog/"]');

            // Always try to extract subcategories from __NUXT__ data first
            const subCats = await page.evaluate(() => {
                const results = [];
                if (window.__NUXT__ && window.__NUXT__.data) {
                    for (const entry of window.__NUXT__.data) {
                        if (!entry || !entry.categoryData || !entry.categoryData.currentCategory) continue;
                        const current = entry.categoryData.currentCategory;
                        if (current.items && typeof current.items === 'object') {
                            for (const key of Object.keys(current.items)) {
                                const sub = current.items[key];
                                if (sub && sub.title && sub.url && sub.productCount > 0) {
                                    results.push({
                                        name: sub.title,
                                        url: '/catalog/' + sub.url,
                                        productCount: sub.productCount,
                                    });
                                }
                            }
                        }
                    }
                }
                return results;
            });

            if (subCats.length > 0) {
                // Has subcategories — use them (they contain more products)
                for (const sc of subCats) {
                    if (!sc.url.startsWith('http')) sc.url = BASE_URL + sc.url;
                    leafCategories.push(sc);
                }
                console.log(`   ${topCat.name}: ${subCats.length} подкатегорий`);
            } else {
                // No subcategories — this page IS the leaf, check if it has products
                const productCount = await page.evaluate(() => {
                    return document.querySelectorAll('div.product.one-product-in-row').length;
                });
                if (productCount > 0) {
                    leafCategories.push({ name: topCat.name, url: topCat.url, productCount });
                    console.log(`   ${topCat.name}: leaf (${productCount} товаров на странице)`);
                }
            }

            await delay(500, 1000);
        } catch (err) {
            console.error(`   ❌ Ошибка при обходе ${topCat.name}: ${err.message}`);
        }
    }

    // Sort by product count descending
    leafCategories.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));

    console.log(`✅ Найдено leaf-категорий: ${leafCategories.length} (сумма товаров: ${leafCategories.reduce((s, c) => s + (c.productCount || 0), 0)})`);
    return leafCategories;
}

/**
 * Parse product cards directly from a category page.
 * Each product card has structure:
 *   div.product[id] — product ID
 *     meta[itemprop="name"] — title
 *     img.image[src] — image URL
 *     a.title[href] — link + title text
 *     .special-price — sale price
 *     .regular-price — regular price
 *     .regular-price.old-price — old price when special exists
 */
function parseProductCards(html) {
    const $ = cheerio.load(html);
    const products = [];

    $('div.product.one-product-in-row').each((_, card) => {
        const $card = $(card);
        const sourceId = $card.attr('id');
        if (!sourceId) return;

        // Title from meta or from a.title
        let title = $card.find('meta[itemprop="name"]').attr('content') || '';
        if (!title) {
            title = $card.find('a.title').text().trim();
        }
        if (!title) return;

        // Product URL
        const linkHref = $card.find('a.title').attr('href') || $card.find('a[href*="/p-"]').attr('href') || '';
        const sourceUrl = linkHref ? (linkHref.startsWith('http') ? linkHref : BASE_URL + linkHref) : '';

        // Image — get highest resolution by removing imgproxy resize
        let imageUrl = $card.find('img.image').attr('src') || $card.find('link[itemprop="contentUrl"]').attr('href') || '';
        if (imageUrl) {
            // Convert thumbnail to full size: remove rs:fit:190:190
            imageUrl = imageUrl.replace(/\/rs:fit:\d+:\d+\//, '/rs:fit:800:800/');
            if (!imageUrl.startsWith('http')) {
                imageUrl = BASE_URL + imageUrl;
            }
        }
        const images = imageUrl ? [imageUrl] : [];

        // Prices
        const specialPriceText = $card.find('.special-price').first().text();
        const regularPriceText = $card.find('.regular-price').first().text();
        const hasOldPrice = $card.find('.regular-price.old-price').length > 0;

        let price, oldPrice;
        if (specialPriceText) {
            // Has special price — special is current, regular is old
            price = parsePrice(specialPriceText) || 0;
            oldPrice = hasOldPrice ? parsePrice(regularPriceText) : null;
        } else {
            // No special price — regular is current
            price = parsePrice(regularPriceText) || 0;
            oldPrice = null;
        }

        // Description from meta
        const description = $card.find('meta[itemprop="description"]').attr('content') || null;

        products.push({
            sourceId,
            sourceUrl,
            title,
            description,
            price,
            oldPrice,
            images,
            specs: [],
            inStock: true,
        });
    });

    return products;
}

/**
 * Scrape products from a category page (with pagination).
 * Opens a fresh tab for each page to avoid Nuxt SPA state corruption.
 */
async function getProductsFromCategory(browser, categoryUrl, maxPages = 3) {
    console.log(`📄 Категория: ${categoryUrl}`);
    const allProducts = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const pageUrl = pageNum === 1 ? categoryUrl : `${categoryUrl}?page=${pageNum}`;
        let freshPage;

        try {
            freshPage = await createPage(browser);
            await freshPage.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await waitForCloudflare(freshPage);
            await freshPage.waitForSelector('.product.one-product-in-row', { timeout: 10000 }).catch(() => {});
            await autoScroll(freshPage);
            await delay(1000, 2000);

            const html = await freshPage.content();
            const products = parseProductCards(html);

            if (products.length === 0) break;

            allProducts.push(...products);
            console.log(`   Страница ${pageNum}: +${products.length} товаров (всего: ${allProducts.length})`);

            await delay(500, 1500);
        } catch (err) {
            console.error(`   ❌ Ошибка на странице ${pageNum}: ${err.message}`);
            if (err.message && err.message.includes('Connection closed')) {
                throw err; // Re-throw so parent can restart browser
            }
            break;
        } finally {
            if (freshPage) await freshPage.close().catch(() => {});
        }
    }

    return allProducts;
}

/**
 * Parse single product page for detailed info (specs, full description, multiple images)
 */
async function parseProductPage(page, productUrl) {
    try {
        const html = await navigateTo(page, productUrl, 'h1');
        const $ = cheerio.load(html);

        const title = $('h1').first().text().trim();
        if (!title) return null;

        const specialPrice = parsePrice($('.special-price').first().text());
        const regularPrice = parsePrice($('.regular-price').first().text());
        const hasOldPrice = $('.regular-price.old-price').length > 0;

        let price, oldPrice;
        if (specialPrice) {
            price = specialPrice;
            oldPrice = hasOldPrice ? regularPrice : null;
        } else {
            price = regularPrice || 0;
            oldPrice = null;
        }

        const description = $('[itemprop="description"]').text().trim() ||
            $('.product-description, .description').first().text().trim() || null;

        const images = [];
        $('img.image, .product-gallery img, .swiper-slide img').each((_, el) => {
            let src = $(el).attr('data-src') || $(el).attr('src');
            if (src && !src.includes('placeholder') && !src.startsWith('data:')) {
                src = src.replace(/\/rs:fit:\d+:\d+\//, '/rs:fit:800:800/');
                if (!src.startsWith('http')) src = BASE_URL + src;
                if (!images.includes(src)) images.push(src);
            }
        });

        const specs = [];
        $('.properties .property, .product-specs tr, .specifications tr').each((_, row) => {
            const name = $(row).find('.property-name, td:first-child').text().trim();
            const value = $(row).find('.property-value, td:last-child').text().trim();
            if (name && value && name !== value) {
                specs.push({ name, value });
            }
        });

        const idMatch = productUrl.match(/p-(\d+)/);
        const sourceId = idMatch ? idMatch[1] : productUrl.split('/').pop();

        return { sourceId, sourceUrl: productUrl, title, description, price, oldPrice, images, specs, inStock: true };
    } catch (err) {
        console.error(`   ❌ Ошибка парсинга ${productUrl}: ${err.message}`);
        return null;
    }
}

/**
 * Main scraping pipeline
 */
async function runScraper(options = {}) {
    const {
        categoriesLimit = 3,
        productsPerCategory = 20,
        maxPagesPerCategory = 5,
        useMock = false,
        onProgress = () => {},
        autoSaveEvery = 0,
        autoSavePath = './products_autosave.json',
        existingProducts = [],
    } = options;

    console.log('🚀 Запуск парсера Fix Price (stealth mode)...');

    if (useMock) {
        console.log('📦 Используем тестовые данные (mock)...');
        onProgress({ phase: 'mock', total: MOCK_PRODUCTS.length });
        await new Promise(r => setTimeout(r, 500));
        return MOCK_PRODUCTS;
    }

    let browser;
    const results = [...existingProducts];
    const knownIds = new Set(existingProducts.map(p => p.sourceId));
    if (existingProducts.length > 0) {
        console.log(`📦 Загружено ${existingProducts.length} существующих товаров (пропуск дубликатов)`);
    }

    try {
        browser = await initBrowser();
        const page = await createPage(browser);

        // Step 1: Pass Cloudflare on main page
        console.log('🌐 Проходим Cloudflare...');
        onProgress({ phase: 'cloudflare', message: 'Проходим проверку Cloudflare...' });
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await waitForCloudflare(page, 30000);
        await delay(2000, 4000);

        // Step 2: Get categories
        onProgress({ phase: 'categories', message: 'Получаем категории...' });
        const allCategories = await getCategories(page);
        const categories = allCategories.slice(0, categoriesLimit);

        if (categories.length === 0) {
            throw new Error('Категории не найдены — возможно, сайт блокирует запросы');
        }

        console.log(`📂 Выбрано категорий: ${categories.length}`);

        // Step 3: Parse products from each category page directly
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            onProgress({ phase: 'extracting', category: cat.name, found: results.length });
            console.log(`\n📁 Категория [${i+1}/${categories.length}]: ${cat.name}`);

            let products = [];
            try {
                products = await getProductsFromCategory(browser, cat.url, maxPagesPerCategory);
            } catch (catErr) {
                if (catErr.message && catErr.message.includes('Connection closed')) {
                    console.log('   🔄 Браузер упал, перезапуск...');
                    try { await browser.close(); } catch (_) {}
                    browser = await initBrowser();
                    const warmPage = await createPage(browser);
                    await warmPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    await waitForCloudflare(warmPage, 30000);
                    await warmPage.close();
                    await delay(3000, 5000);
                    // Retry this category
                    try {
                        products = await getProductsFromCategory(browser, cat.url, maxPagesPerCategory);
                    } catch (retryErr) {
                        console.error(`   ❌ Повторная ошибка: ${retryErr.message}`);
                    }
                } else {
                    console.error(`   ❌ Ошибка категории: ${catErr.message}`);
                }
            }

            // Filter out already-known products
            const newProducts = products.filter(p => !knownIds.has(p.sourceId));
            const limited = newProducts.slice(0, productsPerCategory);
            for (const p of limited) knownIds.add(p.sourceId);
            results.push(...limited);

            if (products.length > 0 && newProducts.length === 0) {
                console.log(`   ⏭️ Все ${products.length} товаров уже есть, пропуск`);
            } else if (products.length > newProducts.length) {
                console.log(`   ⏭️ Пропущено ${products.length - newProducts.length} дубликатов`);
            }

            // Auto-save after every N products
            if (autoSaveEvery > 0 && results.length > 0) {
                const prevCount = results.length - limited.length;
                if (Math.floor(results.length / autoSaveEvery) > Math.floor(prevCount / autoSaveEvery)) {
                    const fs = require('fs');
                    fs.writeFileSync(autoSavePath, JSON.stringify(results, null, 2), 'utf-8');
                    console.log(`   💾 Автосохранение: ${results.length} товаров → ${autoSavePath}`);
                }
            }

            onProgress({
                phase: 'parsing',
                category: cat.name,
                current: limited.length,
                total: limited.length,
                found: results.length,
            });

            await delay(2000, 4000);
        }

        // Final auto-save before dedup
        if (autoSaveEvery > 0 && results.length > 0) {
            const fs = require('fs');
            fs.writeFileSync(autoSavePath, JSON.stringify(results, null, 2), 'utf-8');
            console.log(`   💾 Финальное сохранение: ${results.length} товаров → ${autoSavePath}`);
        }

        // Deduplicate by sourceId
        const seen = new Set();
        const unique = results.filter(p => {
            if (!p.sourceId || seen.has(p.sourceId)) return false;
            seen.add(p.sourceId);
            return true;
        });

        console.log(`\n✅ Успешно распарсено: ${unique.length} товаров`);
        return unique;

    } catch (err) {
        console.error('❌ Ошибка парсинга:', err.message);
        console.log('📦 Возвращаем тестовые данные (mock)...');
        onProgress({ phase: 'fallback_to_mock', error: err.message });
        return MOCK_PRODUCTS;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = {
    runScraper,
    getCategories,
    getProductsFromCategory,
    parseProductPage,
    parseProductCards,
    initBrowser,
};
