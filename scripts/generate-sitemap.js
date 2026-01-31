#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base URL for the site
const BASE_URL = process.env.SITE_URL || 'https://fixprice-pro.com';

// Get products data
const productsPath = path.join(__dirname, '../src/api/mock/data/products.ts');
const productsContent = fs.readFileSync(productsPath, 'utf-8');

// Extract product slugs (naive parsing - in production use proper TS parser)
const productMatches = productsContent.match(/slug:\s*['"`]([^'"`]+)['"`]/g) || [];
const productSlugs = productMatches.map((match) => match.split("'")[1] || match.split('`')[1] || match.split('"')[1]);

// Static routes
const staticRoutes = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'daily',
  },
  {
    url: '/catalog',
    priority: '0.9',
    changefreq: 'daily',
  },
  {
    url: '/promotions',
    priority: '0.8',
    changefreq: 'weekly',
  },
  {
    url: '/stores',
    priority: '0.7',
    changefreq: 'monthly',
  },
  {
    url: '/search',
    priority: '0.8',
    changefreq: 'daily',
  },
];

// Category routes
const categoryRoutes = [
  { name: 'kitchen', priority: '0.85', changefreq: 'weekly' },
  { name: 'bedroom', priority: '0.85', changefreq: 'weekly' },
  { name: 'bathroom', priority: '0.85', changefreq: 'weekly' },
  { name: 'storage', priority: '0.85', changefreq: 'weekly' },
  { name: 'decor', priority: '0.85', changefreq: 'weekly' },
  { name: 'outdoor', priority: '0.85', changefreq: 'weekly' },
];

// Generate sitemap
function generateSitemap() {
  const urls = [];

  // Add static routes
  staticRoutes.forEach((route) => {
    urls.push({
      url: route.url,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route.changefreq,
      priority: route.priority,
    });
  });

  // Add category routes
  categoryRoutes.forEach((category) => {
    urls.push({
      url: `/catalog/${category.name}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: category.changefreq,
      priority: category.priority,
    });
  });

  // Add product routes
  productSlugs.forEach((slug, idx) => {
    urls.push({
      url: `/product/${slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: (0.7 - idx * 0.0001).toFixed(4), // Slightly decrease priority for older products
    });
  });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((item) => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${item.url}</loc>\n`;
    xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Generate robots.txt
function generateRobots() {
  return `# Robots file for Fix Price Pro
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /*.json$

# Crawl delays
Crawl-delay: 1

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Google Search Console
User-agent: Googlebot
Crawl-delay: 0

# Yandex
User-agent: Yandex
Allow: /

# Facebook
User-agent: facebookexternalhit
Allow: /
`;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const sitemapContent = generateSitemap();
fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`✅ Sitemap generated: ${sitemapPath} (${productSlugs.length + staticRoutes.length + categoryRoutes.length} URLs)`);

// Write robots.txt
const robotsPath = path.join(publicDir, 'robots.txt');
const robotsContent = generateRobots();
fs.writeFileSync(robotsPath, robotsContent);
console.log(`✅ Robots.txt generated: ${robotsPath}`);
