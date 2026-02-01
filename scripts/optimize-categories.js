import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../src/api/mock/data/products.ts');
const IMAGES_DIR = path.join(__dirname, '../public/images/categories');

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function optimizeCategories() {
    console.log('📦 Reading products file for categories...');
    let content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');

    // Regex for category images: image: 'https://...'
    const urlRegex = /image:\s*['"](https?:\/\/[^'"]+)['"]/g;

    // Find all unique URLs
    const matches = Array.from(content.matchAll(urlRegex));
    const uniqueUrls = [...new Set(matches.map(m => m[1]))];

    console.log(`✨ Found ${uniqueUrls.length} category images to process`);

    const urlToLocalMap = new Map();

    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        try {
            // These are placehold.co images usually
            const urlObj = new URL(url);
            // generate name based on text param or hash
            const textParam = urlObj.searchParams.get('text') || 'category';
            const safeName = textParam.replace(/[^a-z0-9а-яё]/gi, '_').toLowerCase();
            const newFilename = `${safeName}.webp`;
            const outputPath = path.join(IMAGES_DIR, newFilename);
            const publicPath = `/images/categories/${newFilename}`;

            console.log(`[${i + 1}/${uniqueUrls.length}] ⬇️  Processing: ${safeName}...`);

            const response = await axios({
                url,
                responseType: 'arraybuffer'
            });

            await sharp(response.data)
                .webp({ quality: 90 })
                .toFile(outputPath);

            urlToLocalMap.set(url, publicPath);

        } catch (error) {
            console.error(`❌ Error processing ${url}:`, error.message);
        }
    }

    console.log('🔄 Updating products.ts...');

    let newContent = content;
    for (const [url, localPath] of urlToLocalMap) {
        const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        newContent = newContent.replace(new RegExp(escapedUrl, 'g'), localPath);
    }

    fs.writeFileSync(PRODUCTS_FILE, newContent, 'utf-8');
    console.log('✅ Done! Categories updated.');
}

optimizeCategories();
