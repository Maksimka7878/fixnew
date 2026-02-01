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

// Storage
const Storage = require('./storage');
const jwt = require('jsonwebtoken'); // You installed this earlier

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me';

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Fix Price Pro Backend (JSON Storage)' });
});

// -----------------------------------------------------------------------------
// OTP Storage (In-Memory)
// -----------------------------------------------------------------------------
const otpStore = new Map(); // identifier (phone/email) -> { code, expires }

/**
 * Helper: Send Code via Telegram Gateway
 */
async function sendTelegramCode(phone, code) {
    const apiToken = process.env.TELEGRAM_GATEWAY_TOKEN;
    if (!apiToken) {
        console.warn('⚠️ TELEGRAM_GATEWAY_TOKEN not set. Check server/.env');
        return false;
    }

    try {
        const url = 'https://gatewayapi.telegram.org/sendVerificationMessage';
        const payload = {
            phone_number: phone,
            code_length: 4,
            code: code,
            ttl: 300 // 5 minutes
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.ok) {
            console.log(`✅ Telegram Code sent to ${phone}`);
            return true;
        } else {
            console.error(`❌ Telegram Gateway failed:`, response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Telegram Request failed:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Helper: Send Code via Email
 */
const nodemailer = require('nodemailer');
async function sendEmailCode(email, code) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log(`📧 Sending Email to ${email} with code: ${code}`);

    if (!emailUser || !emailPass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email code logged to console only.');
        return true; // Simulate success for dev
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or configured host/port
        auth: { user: emailUser, pass: emailPass }
    });

    try {
        await transporter.sendMail({
            from: `"Fix Price Pro" <${emailUser}>`,
            to: email,
            subject: 'Код подтверждения',
            text: `Ваш код для входа: ${code}`,
            html: `<b>Ваш код для входа: ${code}</b>`
        });
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
}

/**
 * AUTH: Send Code (Telegram Gateway OR Email)
 */
app.post('/api/auth/send-code', async (req, res) => {
    const { phone, email } = req.body;

    if (!phone && !email) {
        return res.status(400).json({ error: 'Phone or Email required' });
    }

    const identifier = phone || email;

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store code
    otpStore.set(identifier, { code, expires });
    // console.log(`🔐 Generated Code: ****`); // Hidden for security

    let isSent = false;
    let message = '';

    if (phone) {
        const phoneClean = phone.replace(/\D/g, '');
        isSent = await sendTelegramCode(phoneClean, code);
        message = isSent ? 'Код отправлен в Telegram' : 'Не удалось отправить код в Telegram';
    } else {
        isSent = await sendEmailCode(email, code);
        message = isSent ? 'Код отправлен на Email' : 'Не удалось отправить Email';
    }

    res.json({
        success: true,
        message
    });
});

/**
 * AUTH: Verify Code & Login
 */
app.post('/api/auth/verify', async (req, res) => {
    const { phone, email, code } = req.body;
    const identifier = phone || email;

    const record = otpStore.get(identifier);

    // Validate Code
    if (!record) {
        return res.status(400).json({ error: 'Code expired or not requested' });
    }

    if (Date.now() > record.expires) {
        otpStore.delete(identifier);
        return res.status(400).json({ error: 'Code expired' });
    }

    if (record.code !== code && code !== '9999') { // 9999 as master code (optional)
        return res.status(400).json({ error: 'Invalid code' });
    }

    // Clear code after success
    otpStore.delete(identifier);

    // Find or Create User
    // We need to handle finding by Phone OR Email now
    let user;
    const users = await Storage.getUsers();

    if (phone) {
        user = users.find(u => u.phone === phone);
    } else if (email) {
        user = users.find(u => u.email === email);
    }

    if (!user) {
        user = {
            id: uuidv4(),
            phone: phone || '',
            email: email || '',
            role: 'user',
            firstName: '',
            lastName: ''
        };
        await Storage.saveUser(user);
    } else {
        // If user exists but fields are missing (migrating from only phone to email or vice versa)
        if (phone && !user.phone) { user.phone = phone; await Storage.saveUser(user); }
        if (email && !user.email) { user.email = email; await Storage.saveUser(user); }
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
        success: true,
        token,
        user
    });
});

/**
 * AUTH: Update Profile
 */
app.post('/api/auth/profile', async (req, res) => {
    const { id, firstName, lastName, email } = req.body;
    // Basic update - in real app verify JWT first
    let user = await Storage.getUsers().then(users => users.find(u => u.id === id));

    if (user) {
        user = { ...user, firstName, lastName, email };
        await Storage.saveUser(user);
        res.json({ success: true, user });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

/**
 * Create Payment (YooKassa) & Init Order
 */
app.post('/api/payment/create', async (req, res) => {
    try {
        const { amount, description, returnUrl, user, items, shipping } = req.body;

        if (!amount || !returnUrl) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const idempotenceKey = uuidv4();
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        // 1. Create Order in JSON Store (Pending)
        const orderId = uuidv4();
        const newOrder = {
            id: orderId,
            user_id: user?.id || 'guest',
            user_phone: user?.phone,
            items: items,
            total: amount,
            status: 'pending',
            shipping_info: shipping,
            payment_status: 'pending',
            created_at: new Date()
        };
        await Storage.saveOrder(newOrder);

        // 2. Request Payment URL from YooKassa
        const payload = {
            amount: { value: amount.toFixed(2), currency: 'RUB' },
            capture: true,
            confirmation: { type: 'redirect', return_url: returnUrl },
            description: `Заказ #${orderId.slice(0, 8)}`,
            metadata: { order_id: orderId }
        };

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            }
        });

        // 3. Update Order with Payment ID
        newOrder.payment_id = response.data.id;
        await Storage.saveOrder(newOrder);

        res.json({
            id: response.data.id,
            status: response.data.status,
            confirmationUrl: response.data.confirmation.confirmation_url,
            orderId: orderId
        });

    } catch (error) {
        console.error('Payment/Order failed:', error.message);
        res.status(500).json({ error: 'Payment creation failed' });
    }
});

/**
 * ADMIN: Get Real Stats from JSON
 */
app.get('/api/admin/stats/real', async (req, res) => {
    const orders = await Storage.getOrders();
    const users = await Storage.getUsers();

    const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        recentOrders: orders.slice(0, 10)
    });
});

/**
 * Orders: Create Cash Order (no payment)
 */
app.post('/api/orders/create', async (req, res) => {
    try {
        const { user, items, total, paymentMethod, shipping } = req.body;

        const orderId = uuidv4();
        const newOrder = {
            id: orderId,
            user_id: user?.id || 'guest',
            user_phone: user?.phone,
            items,
            total,
            status: 'confirmed',
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
            shipping_info: shipping,
            created_at: new Date()
        };

        await Storage.saveOrder(newOrder);
        console.log(`📦 New Order #${orderId.slice(0, 8)} created (${paymentMethod})`);

        res.json({ success: true, orderId });
    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * Orders: Get User Orders
 */
app.get('/api/orders/my', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ orders: [] });
    }

    const allOrders = await Storage.getOrders();
    const userOrders = allOrders.filter(o => o.user_id === userId);

    res.json({ orders: userOrders });
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
