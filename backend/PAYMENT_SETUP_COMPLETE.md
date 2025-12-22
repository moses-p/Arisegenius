# ✅ Pesapal Integration for MTN & Airtel - COMPLETE

## 📱 Configuration Status

### Payment Gateway: Pesapal
Both **MTN Mobile Money** and **Airtel Money** are now processed through **Pesapal** payment gateway.

### Default Phone Numbers Configured:
- **MTN Mobile Money**: `+256775538145` (256775538145)
- **Airtel Money**: `+256743232445` (256743232445)

### ✅ What's Been Configured:

1. **Payment Service Updated**
   - ✅ Integrated Pesapal API for MTN and Airtel payments
   - ✅ Default phone numbers configured
   - ✅ Automatic phone number formatting (handles +, spaces, country codes)
   - ✅ Falls back to default numbers if no phone provided in payment request
   - ✅ Pesapal webhook/IPN handler implemented

2. **Environment Variables**
   - ✅ Pesapal configuration added to `env.example`
   - ✅ `MTN_DEFAULT_PHONE=256775538145` configured
   - ✅ `AIRTEL_DEFAULT_PHONE=256743232445` configured

3. **Setup Scripts**
   - ✅ `setup-pesapal.js` - Interactive Pesapal setup
   - ✅ `setup-mtn-airtel-auto.js` - Auto-configuration helper

## 🚀 How It Works

### Payment Flow:

1. **When a payment is initiated:**
   - If `phoneNumber` is provided in `paymentDetails`, it uses that
   - If `phoneNumber` is NOT provided, it automatically uses the default:
     - MTN payments → `+256775538145`
     - Airtel payments → `+256743232445`

2. **Phone Number Formatting:**
   - Automatically removes `+` sign
   - Removes spaces
   - Ensures country code `256` is present
   - Converts local format (0775538145) to international (256775538145)

### Example Payment Request:

```javascript
// Without phone number - uses default automatically
POST /api/v1/payments/process
{
  "orderId": "order_123",
  "method": "MTN_MOBILE_MONEY",
  "paymentDetails": {}
  // Phone number automatically set to +256775538145
}

// With phone number - uses provided number
POST /api/v1/payments/process
{
  "orderId": "order_123",
  "method": "AIRTEL_MONEY",
  "paymentDetails": {
    "phoneNumber": "+256700000000"
  }
}
```

## ⚠️ Next Steps (Required for Production)

To enable actual payments, you need to add Pesapal credentials:

### Pesapal Setup:
1. Register at: https://developer.pesapal.com
2. Create a merchant account
3. Get your credentials:
   - `PESAPAL_CONSUMER_KEY`
   - `PESAPAL_CONSUMER_SECRET`
4. Add to `.env`:
   ```env
   PESAPAL_CONSUMER_KEY="your_consumer_key"
   PESAPAL_CONSUMER_SECRET="your_consumer_secret"
   PESAPAL_ENVIRONMENT="sandbox"  # or "production"
   ```

**Quick Setup:**
```bash
node backend/setup-pesapal.js
```

## ✅ Verification

After adding credentials, restart your backend server. You should see:

```
✅ Payment services initialized
  - Stripe: ⚠️  Not configured (development mode)
  - M-Pesa: ⚠️  Not configured (development mode)
  - Pesapal (MTN & Airtel): ✅ Configured
    📱 MTN Mobile Money: Available via Pesapal
    📱 Airtel Money: Available via Pesapal
```

## 🧪 Testing

Once credentials are added, you can test payments:

1. Create an order
2. Process payment with MTN or Airtel
3. Payment will automatically use default phone numbers if not specified
4. User receives payment prompt on their phone

## 📝 Notes

- Default phone numbers are set for **immediate payment capability**
- Phone numbers are automatically formatted for API compatibility
- Pesapal defaults to `sandbox` environment for testing
- Change `PESAPAL_ENVIRONMENT` to `production` when ready
- Both MTN and Airtel payments go through Pesapal gateway

---

**Status**: ✅ Configuration Complete - Ready for API Credentials

