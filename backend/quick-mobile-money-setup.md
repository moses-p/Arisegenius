# Quick Mobile Money Setup Guide

## 🚀 Automated Setup

Run the interactive setup script:
```bash
node backend/setup-mobile-money.js
```

This will:
- Open developer portals in your browser
- Guide you through registration
- Help you enter credentials
- Save everything to `.env` automatically

---

## 📋 Manual Setup (If Needed)

### M-Pesa (Safaricom)

1. **Register**: https://developer.safaricom.co.ke
2. **Create App**: Get Consumer Key and Secret
3. **Get Passkey**: From developer portal
4. **Add to `.env`**:
```env
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_BUSINESS_SHORT_CODE="174379"
MPESA_PASSKEY="your_passkey"
MPESA_ENVIRONMENT="sandbox"
```

### Airtel Money

1. **Register**: https://developer.airtel.africa
2. **Create Application**: Get credentials
3. **Add to `.env`**:
```env
AIRTEL_CLIENT_ID="your_client_id"
AIRTEL_CLIENT_SECRET="your_client_secret"
AIRTEL_MERCHANT_ID="your_merchant_id"
AIRTEL_ENVIRONMENT="sandbox"
```

### MTN Mobile Money

1. **Register**: https://momodeveloper.mtn.com
2. **Create Product**: Get Subscription Key
3. **Add to `.env`**:
```env
MTN_SUBSCRIPTION_KEY="your_subscription_key"
MTN_ENVIRONMENT="sandbox"
```

---

## ⚡ Quick Test Setup

For testing, you can use sandbox credentials. All three services offer sandbox/test environments that don't require real money.

---

## ✅ Verification

After setup, restart your backend. You should see:
```
✅ Payment services initialized
  - Stripe: ✅ Configured
  - M-Pesa: ✅ Configured
  - Airtel Money: ✅ Configured
  - MTN Mobile Money: ✅ Configured
```

