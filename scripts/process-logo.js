import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input file: The one user mentioned
const INPUT_FILE = '/Users/a1111/Desktop/logo.png';
const OUTPUT_FILE = path.join(__dirname, '../public/logo.webp');

async function processLogo() {
    try {
        console.log('🖼️ Processing logo...');

        // Convert to WebP, resize if needed (e.g. height 40-50px is usually good for header, but let's keep it high res enough for retina)
        // We'll keep height/width unrestricted but optimize format. Header usually constrains width via CSS.
        await sharp(INPUT_FILE)
            .webp({ quality: 90 })
            .toFile(OUTPUT_FILE);

        console.log('✅ Logo saved to public/logo.webp');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

processLogo();
