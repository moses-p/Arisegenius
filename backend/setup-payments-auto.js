#!/usr/bin/env node

/**
 * Automated Payment Gateway Setup
 * Sets up payment gateway configuration with test credentials structure
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n💳 Automated Payment Gateway Configuration\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Run auto-configure.js first.');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Update payment gateway sections with better formatted placeholders
const updates = {
  // Stripe - with instructions
  'STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"': 'STRIPE_SECRET_KEY="sk_test_51..." # Get from https://dashboard.stripe.com/test/apikeys',
  'STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"': 'STRIPE_PUBLISHABLE_KEY="pk_test_51..." # Get from https://dashboard.stripe.com/test/apikeys',
  'STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"': 'STRIPE_WEBHOOK_SECRET="whsec_..." # Optional: Get from Stripe Dashboard → Webhooks',
  
  // M-Pesa - with instructions
  'MPESA_CONSUMER_KEY="your_mpesa_consumer_key"': 'MPESA_CONSUMER_KEY="" # Get from https://developer.safaricom.co.ke',
  'MPESA_CONSUMER_SECRET="your_mpesa_consumer_secret"': 'MPESA_CONSUMER_SECRET="" # Get from https://developer.safaricom.co.ke',
  'MPESA_BUSINESS_SHORT_CODE="174379"': 'MPESA_BUSINESS_SHORT_CODE="174379" # Sandbox test code',
  'MPESA_PASSKEY="your_mpesa_passkey"': 'MPESA_PASSKEY="" # Get from Safaricom Developer Portal',
  'MPESA_ENVIRONMENT="sandbox"': 'MPESA_ENVIRONMENT="sandbox" # Use "sandbox" for testing, "production" for live',
  
  // Airtel Money
  'AIRTEL_CLIENT_ID="your_airtel_client_id"': 'AIRTEL_CLIENT_ID="" # Get from https://developer.airtel.africa',
  'AIRTEL_CLIENT_SECRET="your_airtel_client_secret"': 'AIRTEL_CLIENT_SECRET="" # Get from https://developer.airtel.africa',
  'AIRTEL_MERCHANT_ID="your_airtel_merchant_id"': 'AIRTEL_MERCHANT_ID="" # Get from https://developer.airtel.africa',
  'AIRTEL_ENVIRONMENT="sandbox"': 'AIRTEL_ENVIRONMENT="sandbox" # Use "sandbox" for testing, "production" for live',
  
  // MTN Mobile Money
  'MTN_SUBSCRIPTION_KEY="your_mtn_subscription_key"': 'MTN_SUBSCRIPTION_KEY="" # Get from https://momodeveloper.mtn.com',
  'MTN_ENVIRONMENT="sandbox"': 'MTN_ENVIRONMENT="sandbox" # Use "sandbox" for testing, "production" for live',
};

// Apply updates
Object.entries(updates).forEach(([old, replacement]) => {
  if (envContent.includes(old.split('=')[0])) {
    envContent = envContent.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacement);
  }
});

// Save updated .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Payment gateway configuration structure updated!\n');
console.log('📝 Configuration Status:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Configuration structure ready');
console.log('⚠️  Credentials need to be added manually\n');
console.log('🚀 Quick Setup Guide:\n');
console.log('1. STRIPE (Recommended for testing):');
console.log('   → Go to: https://dashboard.stripe.com/test/apikeys');
console.log('   → Copy test keys and add to .env\n');
console.log('2. M-PESA:');
console.log('   → Register: https://developer.safaricom.co.ke');
console.log('   → Get credentials and add to .env\n');
console.log('3. AIRTEL MONEY:');
console.log('   → Register: https://developer.airtel.africa');
console.log('   → Get credentials and add to .env\n');
console.log('4. MTN MOBILE MONEY:');
console.log('   → Register: https://momodeveloper.mtn.com');
console.log('   → Get credentials and add to .env\n');
console.log('📖 For detailed instructions, see: backend/get-test-credentials.md\n');
console.log('💡 Tip: Start with Stripe for quick testing, add others when needed.\n');

