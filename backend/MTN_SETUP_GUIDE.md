# MTN Mobile Money Setup Guide

## 🚀 Quick Setup Steps

### 1. Register at MTN Developer Portal
- **URL**: https://momodeveloper.mtn.com
- Sign up for a free account
- Verify your email if required

### 2. Create a Product
- Go to "Products" section in the dashboard
- Click "Create Product" or select existing product
- Choose "Collection" or "Disbursement" based on your needs
- For testing, use "Sandbox" environment

### 3. Get Your Subscription Key
- In your product dashboard, find "Subscription Key"
- Copy the subscription key (it's usually a long string)
- This is your `MTN_SUBSCRIPTION_KEY`

### 4. Configure in .env

Edit `backend/.env` and update:

```env
MTN_SUBSCRIPTION_KEY="your_subscription_key_here"
MTN_ENVIRONMENT="sandbox"
```

### 5. Restart Backend

After saving, restart your backend server. You should see:
```
✅ Payment services initialized
  - MTN Mobile Money: ✅ Configured
```

## 📝 Configuration Details

**Sandbox (Testing):**
- Use for development and testing
- No real money transactions
- Free to use

**Production (Live):**
- Use for real payments
- Requires approval from MTN
- Real money transactions

## 🔍 Finding Your Subscription Key

1. Login to https://momodeveloper.mtn.com
2. Navigate to your product
3. Look for "Subscription Key" or "Primary Key"
4. Copy the entire key (usually starts with a long alphanumeric string)

## ✅ Verification

After configuration, test the connection:
```bash
# Restart backend
npm run dev

# Check console output for:
# - MTN Mobile Money: ✅ Configured
```

## 🆘 Troubleshooting

**If you see "Not configured":**
- Check that `MTN_SUBSCRIPTION_KEY` is not empty in `.env`
- Verify the key is correct (no extra spaces)
- Make sure you restarted the backend

**If connection fails:**
- Verify you're using the correct environment (sandbox/production)
- Check that your MTN developer account is active
- Ensure the subscription key matches your product

## 💡 Tips

- Start with sandbox for testing
- Keep your subscription key secure
- Don't commit `.env` to git
- Use different keys for development and production

