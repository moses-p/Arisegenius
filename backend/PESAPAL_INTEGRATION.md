# Pesapal Integration for MTN & Airtel Mobile Money

## ✅ Integration Complete

Both **MTN Mobile Money** and **Airtel Money** payments are now processed through **Pesapal** payment gateway.

## 📋 Configuration

### Environment Variables Required:

```env
# Pesapal Configuration
PESAPAL_CONSUMER_KEY="your_pesapal_consumer_key"
PESAPAL_CONSUMER_SECRET="your_pesapal_consumer_secret"
PESAPAL_ENVIRONMENT="sandbox"  # sandbox or production
PESAPAL_CALLBACK_URL="http://localhost:3000/api/v1/payments/pesapal/callback"
PESAPAL_IPN_URL="http://localhost:3000/api/v1/payments/pesapal/ipn"

# Default Phone Numbers (used if not provided in payment request)
MTN_DEFAULT_PHONE="256775538145"      # +256775538145
AIRTEL_DEFAULT_PHONE="256743232445"   # +256743232445
```

## 🚀 Quick Setup

Run the setup script:

```bash
node backend/setup-pesapal.js
```

This will guide you through:
1. Getting Pesapal credentials from https://developer.pesapal.com
2. Adding credentials to `.env`
3. Configuring callback URLs

## 💳 How It Works

### Payment Flow:

1. **User initiates payment** with MTN or Airtel method
2. **System creates Pesapal order** with order details
3. **Pesapal returns payment link** for redirect
4. **User redirected to Pesapal** payment page
5. **User completes payment** on Pesapal (MTN/Airtel)
6. **Pesapal sends IPN** to our server
7. **System updates payment status** automatically

### Default Phone Numbers:

- **MTN**: `+256775538145` (automatically used if no phone provided)
- **Airtel**: `+256743232445` (automatically used if no phone provided)

## 📡 API Endpoints

### Process Payment:
```http
POST /api/v1/payments/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_123",
  "method": "MTN_MOBILE_MONEY",  // or "AIRTEL_MONEY"
  "paymentDetails": {
    "phoneNumber": "+256775538145"  // Optional, uses default if not provided
  }
}
```

### Response:
```json
{
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "payment_123",
    "status": "PROCESSING",
    "transactionId": "pesapal_tracking_id",
    "redirectUrl": "https://cybqa.pesapal.com/pesapalv3/...",
    "message": "MTN Mobile Money payment initiated via Pesapal. Redirecting to payment page..."
  }
}
```

### Callback URL:
```http
GET /api/v1/payments/pesapal/callback?OrderTrackingId=xxx&OrderMerchantReference=xxx
```
Redirects user back to frontend after payment.

### IPN Endpoint:
```http
POST /api/v1/payments/pesapal/ipn
```
Receives payment status updates from Pesapal (handled automatically).

## 🔧 Implementation Details

### Payment Methods Supported:
- `MTN_MOBILE_MONEY` → Processed via Pesapal (MTNMOBILEMONEYUG)
- `AIRTEL_MONEY` → Processed via Pesapal (AIRTELMONEYUG)

### Payment Provider:
Both methods use `PaymentProvider.PESAPAL` in the database.

### Phone Number Formatting:
- Automatically formats phone numbers to international format (256...)
- Removes `+` signs and spaces
- Adds country code if missing

## ✅ Verification

After adding Pesapal credentials, restart backend. You should see:

```
✅ Payment services initialized
  - Stripe: ⚠️  Not configured (development mode)
  - M-Pesa: ⚠️  Not configured (development mode)
  - Pesapal (MTN & Airtel): ✅ Configured
    📱 MTN Mobile Money: Available via Pesapal
    📱 Airtel Money: Available via Pesapal
```

## 📝 Notes

- **Sandbox Environment**: Use for testing (no real money)
- **Production Environment**: Switch when ready for live payments
- **IPN Handling**: Automatically updates payment status when Pesapal sends notifications
- **Callback URL**: Configure in Pesapal dashboard to match your API_BASE_URL
- **Phone Numbers**: Default numbers are used if customer doesn't provide one

---

**Status**: ✅ Fully Integrated - Ready for Pesapal Credentials

