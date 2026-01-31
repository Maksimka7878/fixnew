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

// Start Server
app.listen(PORT, () => {
    console.log(`Payment Service running on http://localhost:${PORT}`);
});
