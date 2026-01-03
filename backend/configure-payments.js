#!/usr/bin/env node

/**
 * Payment Gateway Configuration Helper
 * Helps set up all payment gateways with test/sandbox credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configurePayments() {
  console.log('\n💳 Payment Gateway Configuration\n');
  console.log('This will help you configure all payment gateways.\n');
  console.log('For development, you can use test/sandbox credentials.\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Run auto-configure.js first.');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. STRIPE (Credit/Debit Cards)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Get test keys from: https://dashboard.stripe.com/test/apikeys\n');

  const useStripe = await question('Configure Stripe? (y/n, default: y): ');
  if (useStripe.toLowerCase() !== 'n') {
    const stripeSecret = await question('Stripe Secret Key (sk_test_...): ');
    if (stripeSecret) {
      envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/, `STRIPE_SECRET_KEY="${stripeSecret}"`);
    }

    const stripePublishable = await question('Stripe Publishable Key (pk_test_...): ');
    if (stripePublishable) {
      envContent = envContent.replace(/STRIPE_PUBLISHABLE_KEY=.*/, `STRIPE_PUBLISHABLE_KEY="${stripePublishable}"`);
    }

    const stripeWebhook = await question('Stripe Webhook Secret (optional, whsec_...): ');
    if (stripeWebhook) {
      envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/, `STRIPE_WEBHOOK_SECRET="${stripeWebhook}"`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. M-PESA (Safaricom - Kenya)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Register at: https://developer.safaricom.co.ke\n');

  const useMpesa = await question('Configure M-Pesa? (y/n, default: n): ');
  if (useMpesa.toLowerCase() === 'y') {
    const mpesaKey = await question('M-Pesa Consumer Key: ');
    if (mpesaKey) {
      envContent = envContent.replace(/MPESA_CONSUMER_KEY=.*/, `MPESA_CONSUMER_KEY="${mpesaKey}"`);
    }

    const mpesaSecret = await question('M-Pesa Consumer Secret: ');
    if (mpesaSecret) {
      envContent = envContent.replace(/MPESA_CONSUMER_SECRET=.*/, `MPESA_CONSUMER_SECRET="${mpesaSecret}"`);
    }

    const mpesaShortCode = await question('Business Short Code (default: 174379): ');
    if (mpesaShortCode) {
      envContent = envContent.replace(/MPESA_BUSINESS_SHORT_CODE=.*/, `MPESA_BUSINESS_SHORT_CODE="${mpesaShortCode}"`);
    }

    const mpesaPasskey = await question('M-Pesa Passkey: ');
    if (mpesaPasskey) {
      envContent = envContent.replace(/MPESA_PASSKEY=.*/, `MPESA_PASSKEY="${mpesaPasskey}"`);
    }

    const mpesaEnv = await question('Environment (sandbox/production, default: sandbox): ');
    if (mpesaEnv) {
      envContent = envContent.replace(/MPESA_ENVIRONMENT=.*/, `MPESA_ENVIRONMENT="${mpesaEnv}"`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. AIRTEL MONEY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Register at: https://developer.airtel.africa\n');

  const useAirtel = await question('Configure Airtel Money? (y/n, default: n): ');
  if (useAirtel.toLowerCase() === 'y') {
    const airtelClientId = await question('Airtel Client ID: ');
    if (airtelClientId) {
      envContent = envContent.replace(/AIRTEL_CLIENT_ID=.*/, `AIRTEL_CLIENT_ID="${airtelClientId}"`);
    }

    const airtelSecret = await question('Airtel Client Secret: ');
    if (airtelSecret) {
      envContent = envContent.replace(/AIRTEL_CLIENT_SECRET=.*/, `AIRTEL_CLIENT_SECRET="${airtelSecret}"`);
    }

    const airtelMerchant = await question('Airtel Merchant ID: ');
    if (airtelMerchant) {
      envContent = envContent.replace(/AIRTEL_MERCHANT_ID=.*/, `AIRTEL_MERCHANT_ID="${airtelMerchant}"`);
    }

    const airtelEnv = await question('Environment (sandbox/production, default: sandbox): ');
    if (airtelEnv) {
      envContent = envContent.replace(/AIRTEL_ENVIRONMENT=.*/, `AIRTEL_ENVIRONMENT="${airtelEnv}"`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4. MTN MOBILE MONEY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Register at: https://momodeveloper.mtn.com\n');

  const useMTN = await question('Configure MTN Mobile Money? (y/n, default: n): ');
  if (useMTN.toLowerCase() === 'y') {
    const mtnKey = await question('MTN Subscription Key: ');
    if (mtnKey) {
      envContent = envContent.replace(/MTN_SUBSCRIPTION_KEY=.*/, `MTN_SUBSCRIPTION_KEY="${mtnKey}"`);
    }

    const mtnEnv = await question('Environment (sandbox/production, default: sandbox): ');
    if (mtnEnv) {
      envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, `MTN_ENVIRONMENT="${mtnEnv}"`);
    }
  }

  // Save updated .env
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Payment gateway configuration saved!\n');
  console.log('📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Check console output for payment service status');
  console.log('   3. Test payments in sandbox/test mode first\n');

  rl.close();
}

configurePayments().catch(console.error);

