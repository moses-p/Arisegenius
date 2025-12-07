#!/usr/bin/env node

/**
 * Arisegenius Configuration Setup Helper
 * This script helps configure all services automatically
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

async function setupConfig() {
  console.log('\n🚀 Arisegenius Configuration Setup\n');
  console.log('This will help you configure email and payment services.\n');

  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Check if .env exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file\n');
  } else {
    // Copy from env.example
    const examplePath = path.join(__dirname, 'env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
      console.log('📋 Using env.example as template\n');
    } else {
      console.log('❌ env.example not found. Please create .env manually.');
      process.exit(1);
    }
  }

  // Email Configuration
  console.log('📧 Email Service Configuration');
  console.log('Press Enter to skip or keep existing values\n');

  const smtpHost = await question('SMTP Host (e.g., smtp.gmail.com): ');
  if (smtpHost) {
    envContent = envContent.replace(/SMTP_HOST=.*/, `SMTP_HOST="${smtpHost}"`);
  }

  const smtpPort = await question('SMTP Port (default: 587): ');
  if (smtpPort) {
    envContent = envContent.replace(/SMTP_PORT=.*/, `SMTP_PORT=${smtpPort}`);
  }

  const smtpUser = await question('SMTP User/Email: ');
  if (smtpUser) {
    envContent = envContent.replace(/SMTP_USER=.*/, `SMTP_USER="${smtpUser}"`);
  }

  const smtpPass = await question('SMTP Password/App Password: ');
  if (smtpPass) {
    envContent = envContent.replace(/SMTP_PASS=.*/, `SMTP_PASS="${smtpPass}"`);
  }

  const fromEmail = await question('From Email (default: noreply@arisegenius.com): ');
  if (fromEmail) {
    envContent = envContent.replace(/FROM_EMAIL=.*/, `FROM_EMAIL="${fromEmail}"`);
  }

  console.log('\n💳 Payment Gateway Configuration');
  console.log('Press Enter to skip (services will work in development mode)\n');

  // Stripe
  const stripeSecret = await question('Stripe Secret Key (sk_test_...): ');
  if (stripeSecret) {
    envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/, `STRIPE_SECRET_KEY="${stripeSecret}"`);
  }

  const stripePublishable = await question('Stripe Publishable Key (pk_test_...): ');
  if (stripePublishable) {
    envContent = envContent.replace(/STRIPE_PUBLISHABLE_KEY=.*/, `STRIPE_PUBLISHABLE_KEY="${stripePublishable}"`);
  }

  // M-Pesa
  const mpesaKey = await question('M-Pesa Consumer Key: ');
  if (mpesaKey) {
    envContent = envContent.replace(/MPESA_CONSUMER_KEY=.*/, `MPESA_CONSUMER_KEY="${mpesaKey}"`);
  }

  const mpesaSecret = await question('M-Pesa Consumer Secret: ');
  if (mpesaSecret) {
    envContent = envContent.replace(/MPESA_CONSUMER_SECRET=.*/, `MPESA_CONSUMER_SECRET="${mpesaSecret}"`);
  }

  // Save .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Configuration saved to .env file!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your backend server');
  console.log('2. Check the console output for service status');
  console.log('3. Services will show ✅ when properly configured\n');

  rl.close();
}

setupConfig().catch(console.error);
