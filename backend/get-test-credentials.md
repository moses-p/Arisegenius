# How to Get Test Credentials for Payment Gateways

## 🎯 Quick Setup Guide

### 1. Stripe (Easiest - Recommended for Testing)

**Steps:**
1. Go to https://stripe.com and create a free account
2. Navigate to: https://dashboard.stripe.com/test/apikeys
3. Copy the **Publishable key** (starts with `pk_test_`)
4. Click "Reveal test key" and copy the **Secret key** (starts with `sk_test_`)
5. For webhooks (optional): Go to Developers → Webhooks → Add endpoint

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

**Add to .env:**
```env
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
```

---

### 2. M-Pesa (Safaricom - Kenya)

**Steps:**
1. Register at: https://developer.safaricom.co.ke
2. Create an app in the developer portal
3. Get your Consumer Key and Consumer Secret
4. For sandbox testing, use:
   - Business Short Code: `174379` (Lipa Na M-Pesa Online)
   - Passkey: Provided in developer portal

**Sandbox Test Numbers:**
- Phone: `254708374149`
- Amount: Any test amount

**Add to .env:**
```env
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_BUSINESS_SHORT_CODE="174379"
MPESA_PASSKEY="your_passkey"
MPESA_ENVIRONMENT="sandbox"
```

---

### 3. Airtel Money

**Steps:**
1. Register at: https://developer.airtel.africa
2. Create an application
3. Get Client ID, Client Secret, and Merchant ID
4. Use sandbox environment for testing

**Add to .env:**
```env
AIRTEL_CLIENT_ID="your_client_id"
AIRTEL_CLIENT_SECRET="your_client_secret"
AIRTEL_MERCHANT_ID="your_merchant_id"
AIRTEL_ENVIRONMENT="sandbox"
```

---

### 4. MTN Mobile Money

**Steps:**
1. Register at: https://momodeveloper.mtn.com
2. Create a product and get Subscription Key
3. Use sandbox environment for testing

**Add to .env:**
```env
MTN_SUBSCRIPTION_KEY="your_subscription_key"
MTN_ENVIRONMENT="sandbox"
```

---

## 🚀 Quick Configuration

Run the interactive setup:
```bash
node backend/configure-payments.js
```

Or manually edit `backend/.env` with your credentials.

---

## ✅ Verification

After configuration, restart your backend. You should see:
```
✅ Payment services initialized
  - Stripe: ✅ Configured
  - M-Pesa: ✅ Configured (or ⚠️ if not configured)
  - Airtel Money: ✅ Configured (or ⚠️ if not configured)
  - MTN Mobile Money: ✅ Configured (or ⚠️ if not configured)
```

---

## 💡 Development Tip

For development, you only need to configure the payment gateways you'll actually use. Start with Stripe for testing, then add mobile money services when needed.

