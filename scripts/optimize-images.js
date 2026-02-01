import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../src/api/mock/data/products.ts');
const IMAGES_DIR = path.join(__dirname, '../public/images/products');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function optimizeImages() {
    console.log('📦 Reading products file...');
    let content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');

    // Regex to find image URLs
    // looking for: url: 'https://...' or "https://..."
    const urlRegex = /(url|thumbnailUrl):\s*['"](https?:\/\/[^'"]+)['"]/g;

    // Find all unique URLs
    const matches = Array.from(content.matchAll(urlRegex));
    const uniqueUrls = [...new Set(matches.map(m => m[2]))];

    console.log(`✨ Found ${uniqueUrls.length} unique images to process`);

    const urlToLocalMap = new Map();

    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        try {
            // Extract a clean filename or use hash/index
            // We'll use a simple index-based naming or try to extract ID if possible from context, 
            // but unique match is easier. Let's try to keep original name if possible, or hash.
            const urlObj = new URL(url);
            const basename = path.basename(urlObj.pathname);
            const nameWithoutExt = path.parse(basename).name;
            const newFilename = `${nameWithoutExt}.webp`;
            const outputPath = path.join(IMAGES_DIR, newFilename);
            const publicPath = `/images/products/${newFilename}`;

            // Check if file exists to skip download (optional, but good for retries)
            if (!fs.existsSync(outputPath)) {
                console.log(`[${i + 1}/${uniqueUrls.length}] ⬇️  Downloading: ${basename}...`);

                const response = await axios({
                    url,
                    responseType: 'arraybuffer'
                });

                console.log(`   ⚙️  Converting to WebP...`);
                await sharp(response.data)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
            } else {
                console.log(`[${i + 1}/${uniqueUrls.length}] ⏭️  Skipping (exists): ${newFilename}`);
            }

            urlToLocalMap.set(url, publicPath);

        } catch (error) {
            console.error(`❌ Error processing ${url}:`, error.message);
        }
    }

    console.log('🔄 Updating products.ts...');

    // Replace logic
    let newContent = content;
    // We iterate specifically over the map to replace each URL
    for (const [url, localPath] of urlToLocalMap) {
        // Escape regex special chars in url
        const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace globally
        newContent = newContent.replace(new RegExp(escapedUrl, 'g'), localPath);
    }

    // Write back
    fs.writeFileSync(PRODUCTS_FILE, newContent, 'utf-8');
    console.log('✅ Done! products.ts updated.');
}

optimizeImages();
