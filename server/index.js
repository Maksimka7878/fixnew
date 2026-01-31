require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// YooKassa Configuration
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const API_URL = 'https://api.yookassa.ru/v3/payments';

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Payment Service (BFF)' });
});

/**
 * Create Payment
 * POST /api/payment/create
 * Body: { amount: number, description: string, returnUrl: string }
 */
app.post('/api/payment/create', async (req, res) => {
    try {
        const { amount, description, returnUrl } = req.body;

        if (!amount || !returnUrl) {
            return res.status(400).json({ error: 'Missing required fields: amount, returnUrl' });
        }

        const idempotenceKey = uuidv4();

        const payload = {
            amount: {
                value: amount.toFixed(2),
                currency: 'RUB'
            },
            capture: true,
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            },
            description: description || 'Оплата заказа'
        };

        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            }
        });

        // Return the confirmation URL to the frontend
        res.json({
            id: response.data.id,
            status: response.data.status,
            confirmationUrl: response.data.confirmation.confirmation_url
        });

    } catch (error) {
        console.error('YooKassa Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Payment creation failed',
            details: error.response?.data || error.message
        });
    }
});

/**
 * Webhook Handler (Optional for simple version, but good to have)
 * POST /api/payment/webhook
 */
app.post('/api/payment/webhook', (req, res) => {
    const event = req.body;
    // In a real app, verify signature and update DB
    console.log('Received Webhook:', event.event, event.object.id);
    res.sendStatus(200);
});

// -----------------------------------------------------------------------------
// Scraper / Import Routes
// -----------------------------------------------------------------------------
const { runScraper } = require('./scraper');

// In-memory store for import status
let importStatus = { running: false, progress: null, lastResults: null };

/**
 * Get Import Status
 * GET /api/admin/import/status
 */
app.get('/api/admin/import/status', (req, res) => {
    res.json(importStatus);
});

/**
 * Start Import Process
 * POST /api/admin/import
 * Body: { categoriesLimit: number, productsPerCategory: number }
 */
app.post('/api/admin/import', async (req, res) => {
    if (importStatus.running) {
        return res.status(409).json({ error: 'Import already in progress' });
    }

    const { categoriesLimit = 3, productsPerCategory = 20 } = req.body;

    importStatus = { running: true, progress: { phase: 'starting' }, lastResults: null };

    // Run async, return immediately
    res.json({ message: 'Import started', status: importStatus });

    try {
        const products = await runScraper({
            categoriesLimit,
            productsPerCategory,
            onProgress: (p) => { importStatus.progress = p; }
        });

        importStatus = {
            running: false,
            progress: { phase: 'complete', total: products.length },
            lastResults: products
        };

        console.log(`✅ Import complete: ${products.length} products`);

    } catch (err) {
        console.error('Import failed:', err);
        importStatus = {
            running: false,
            progress: { phase: 'error', error: err.message },
            lastResults: null
        };
    }
});

/**
 * Import from JSON file
 * POST /api/admin/import-json
 */
app.post('/api/admin/import-json', (req, res) => {
    if (importStatus.running) {
        return res.status(409).json({ error: 'Import already in progress' });
    }

    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, 'products.json');

    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ error: 'JSON file not found (server/products.json)' });
    }

    importStatus = { running: true, progress: { phase: 'reading_json' }, lastResults: null };
    res.json({ message: 'JSON Import started', status: importStatus });

    // Verify async
    setTimeout(() => {
        try {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            const products = JSON.parse(rawData);

            importStatus = {
                running: false,
                progress: { phase: 'complete', total: products.length },
                lastResults: products
            };
            console.log(`✅ Loaded ${products.length} products from JSON`);

        } catch (err) {
            console.error('JSON Import failed:', err);
            importStatus = {
                running: false,
                progress: { phase: 'error', error: err.message },
                lastResults: null
            };
        }
    }, 1000);
});

/**
 * Get Last Import Results
 * GET /api/admin/import/results
 */
app.get('/api/admin/import/results', (req, res) => {
    if (!importStatus.lastResults) {
        return res.status(404).json({ error: 'No import results available' });
    }
    res.json({ products: importStatus.lastResults });
});

/**
 * API Endpoints for Python Scraper (ETL)
 */
app.get('/api/v1', (req, res) => {
    res.json({ status: 'ok', version: '1.0' });
});

app.post('/api/v1/products', (req, res) => {
    const product = req.body;
    // In a real app, save to DB. Here we just log it.
    console.log(`📥 [API] New Product: ${product.title} (${product.price} ₽)`);
    res.json({
        success: true,
        id: product.source_id || 'new_id',
        message: 'Product created successfully'
    });
});

const multer = require('multer');
const upload = multer();

app.post('/api/v1/media/upload', upload.single('file'), (req, res) => {
    // In a real app, save file to S3/disk.
    console.log(`📥 [API] Image Upload: ${req.file?.originalname} (${req.file?.size} bytes)`);
    res.json({
        success: true,
        url: `https://via.placeholder.com/400?text=${req.file?.originalname}`
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Payment Service running on http://localhost:${PORT}`);
});
