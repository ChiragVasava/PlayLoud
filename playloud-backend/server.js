// playloud-backend/server.js - FIXED VERSION
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const process = require('process');
require('dotenv').config();

const { Client, Databases, ID, Query } = require('node-appwrite');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Razorpay config
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Appwrite server SDK
const awClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(awClient);
const DB_ID = process.env.APPWRITE_DATABASE_ID;
const SUBS_COLL = process.env.SUBSCRIPTIONS_COLLECTION_ID;
const PAY_COLL = process.env.PAYMENTS_COLLECTION_ID;

// Helpers
const PLAN_DAYS = { monthly: 30, quarterly: 90, 'half-yearly': 180 };

// Route: Create Order
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, planId, planName, userId } = req.body;
        
        console.log('📝 Create order request:', { amount, currency, planId, planName, userId });
        
        if (!amount || !currency) {
            return res.status(400).json({ 
                success: false, 
                error: 'Amount and currency required' 
            });
        }

        const order = await razorpay.orders.create({
            amount, // Amount in paise
            currency,
            receipt: `rcpt_${Date.now()}`,
            notes: { planId, planName, userId: userId || 'guest' }
        });

        console.log('✅ Order created:', order.id);

        return res.json({ 
            success: true, 
            orderId: order.id, 
            amount: order.amount, 
            currency: order.currency 
        });
    } catch (err) {
        console.error('❌ create-order error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Route: Verify Payment + Save to Appwrite
app.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            planName,
            amount,
            userId
        } = req.body;

        console.log('🔍 Verify payment request:', { 
            razorpay_order_id, 
            razorpay_payment_id, 
            planId, 
            userId 
        });

        // Verify signature
        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expected !== razorpay_signature) {
            console.error('❌ Invalid signature');
            return res.status(400).json({ success: false, error: 'Invalid signature' });
        }

        console.log('✅ Signature verified');

        // Compute subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (PLAN_DAYS[planId] || 30));

        // FIXED: Amount is already in rupees from frontend, convert to paise for storage
        const amountInPaise = Number(amount) * 100;

        // Check if user already has active subscription
        let existingSubscription = null;
        if (userId) {
            try {
                const existing = await databases.listDocuments(
                    DB_ID, 
                    SUBS_COLL,
                    [
                        Query.equal('userId', userId),
                        Query.equal('status', 'active')
                    ]
                );
                
                if (existing.documents.length > 0) {
                    existingSubscription = existing.documents[0];
                    console.log('ℹ️ User already has active subscription:', existingSubscription.$id);
                }
            } catch (e) {
                console.log('ℹ️ No existing subscription found (or error checking):', e.message);
            }
        }

        // Create payment record
        try {
            const paymentDoc = await databases.createDocument(
                DB_ID, 
                PAY_COLL, 
                ID.unique(), 
                {
                    userId: userId || 'guest',
                    planId,
                    planName,
                    amount: amountInPaise, // Store in paise
                    currency: 'inr',
                    status: 'paid',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpayOrderId: razorpay_order_id,
                    paidAt: new Date().toISOString()
                }
            );
            console.log('✅ Payment record created:', paymentDoc.$id);
        } catch (e) {
            console.error('❌ Save payment error:', e.message);
            console.error('Full error:', e);
        }

        // Create/Update subscription record
        try {
            if (existingSubscription) {
                // Update existing subscription
                const updatedSub = await databases.updateDocument(
                    DB_ID,
                    SUBS_COLL,
                    existingSubscription.$id,
                    {
                        planId,
                        planName,
                        amount: amountInPaise,
                        endDate: endDate.toISOString(),
                        razorpayPaymentId: razorpay_payment_id
                    }
                );
                console.log('✅ Subscription updated:', updatedSub.$id);
            } else {
                // Create new subscription
                const subDoc = await databases.createDocument(
                    DB_ID, 
                    SUBS_COLL, 
                    ID.unique(), 
                    {
                        userId: userId || 'guest',
                        planId,
                        planName,
                        amount: amountInPaise,
                        status: 'active',
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        razorpayPaymentId: razorpay_payment_id
                    }
                );
                console.log('✅ Subscription created:', subDoc.$id);
            }
        } catch (e) {
            console.error('❌ Save subscription error:', e.message);
            console.error('Full error:', e);
        }

        return res.json({ 
            success: true, 
            message: 'Payment verified and subscription activated' 
        });
    } catch (err) {
        console.error('❌ verify-payment error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Webhook handler (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.WEBHOOK_SECRET || '';
        
        if (!webhookSecret) {
            console.warn('⚠️ WEBHOOK_SECRET not configured');
            return res.json({ status: 'ok', message: 'webhook secret not configured' });
        }

        const expected = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');
            
        if (expected !== signature) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = JSON.parse(req.body.toString());
        console.log('📨 Webhook received:', event.event);

        // Handle different webhook events
        switch(event.event) {
            case 'payment.captured':
                console.log('💰 Payment captured:', event.payload.payment.entity.id);
                break;
            case 'payment.failed':
                console.log('❌ Payment failed:', event.payload.payment.entity.id);
                break;
            case 'subscription.cancelled':
                console.log('🚫 Subscription cancelled');
                break;
        }

        return res.json({ status: 'ok' });
    } catch (err) {
        console.error('❌ webhook error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'Server is running ✅',
        endpoints: {
            createOrder: 'POST /create-order',
            verifyPayment: 'POST /verify-payment',
            webhook: 'POST /webhook'
        },
        config: {
            razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
            appwriteConfigured: !!(process.env.APPWRITE_ENDPOINT && process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY),
            databaseId: process.env.APPWRITE_DATABASE_ID,
            subscriptionsCollection: process.env.SUBSCRIPTIONS_COLLECTION_ID,
            paymentsCollection: process.env.PAYMENTS_COLLECTION_ID
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment check:`);
    console.log(`   ✅ Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : '❌ Missing'}`);
    console.log(`   ✅ Razorpay Key Secret: ${process.env.RAZORPAY_KEY_SECRET ? 'Configured' : '❌ Missing'}`);
    console.log(`   ✅ Appwrite Endpoint: ${process.env.APPWRITE_ENDPOINT || '❌ Missing'}`);
    console.log(`   ✅ Appwrite Project: ${process.env.APPWRITE_PROJECT_ID || '❌ Missing'}`);
    console.log(`   ✅ Appwrite API Key: ${process.env.APPWRITE_API_KEY ? 'Configured' : '❌ Missing'}`);
    console.log(`   ✅ Database ID: ${process.env.APPWRITE_DATABASE_ID || '❌ Missing'}`);
    console.log(`   ✅ Subscriptions Collection: ${process.env.SUBSCRIPTIONS_COLLECTION_ID || '❌ Missing'}`);
    console.log(`   ✅ Payments Collection: ${process.env.PAYMENTS_COLLECTION_ID || '❌ Missing'}`);
    console.log(``);
    console.log(`Ready to accept payments! 💳`);
});

