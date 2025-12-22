# ✅ MTN & Airtel Payment Configuration - COMPLETE

## 📱 Configuration Status

### Default Phone Numbers Configured:
- **MTN Mobile Money**: `+256775538145` (256775538145)
- **Airtel Money**: `+256743232445` (256743232445)

### ✅ What's Been Configured:

1. **Payment Service Updated**
   - ✅ Default phone numbers added to MTN and Airtel configs
   - ✅ Automatic phone number formatting (handles +, spaces, country codes)
   - ✅ Falls back to default numbers if no phone provided in payment request

2. **Environment Variables**
   - ✅ `MTN_DEFAULT_PHONE=256775538145` added to `.env`
   - ✅ `AIRTEL_DEFAULT_PHONE=256743232445` added to `.env`
   - ✅ `env.example` updated with default phone numbers

3. **Auto-Configuration Script**
   - ✅ `setup-mtn-airtel-auto.js` created and executed
   - ✅ Automatically configures default phone numbers

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

To enable actual payments, you need to add API credentials:

### MTN Mobile Money:
1. Register at: https://momodeveloper.mtn.com
2. Get your `MTN_SUBSCRIPTION_KEY`
3. Add to `.env`:
   ```env
   MTN_SUBSCRIPTION_KEY="your_actual_subscription_key_here"
   ```

### Airtel Money:
1. Register at: https://developer.airtel.africa
2. Get your credentials:
   - `AIRTEL_CLIENT_ID`
   - `AIRTEL_CLIENT_SECRET`
   - `AIRTEL_MERCHANT_ID`
3. Add to `.env`:
   ```env
   AIRTEL_CLIENT_ID="your_client_id"
   AIRTEL_CLIENT_SECRET="your_client_secret"
   AIRTEL_MERCHANT_ID="your_merchant_id"
   ```

## ✅ Verification

After adding credentials, restart your backend server. You should see:

```
✅ Payment services initialized
  - Stripe: ⚠️  Not configured (development mode)
  - M-Pesa: ⚠️  Not configured (development mode)
  - Airtel Money: ✅ Configured
  - MTN Mobile Money: ✅ Configured
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
- Both services default to `sandbox` environment for testing
- Change `MTN_ENVIRONMENT` and `AIRTEL_ENVIRONMENT` to `production` when ready

---

**Status**: ✅ Configuration Complete - Ready for API Credentials

