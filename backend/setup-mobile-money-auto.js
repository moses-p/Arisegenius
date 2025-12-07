#!/usr/bin/env node

/**
 * Automated Mobile Money Setup (Non-Interactive)
 * Sets up test/sandbox credentials structure
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n💳 Automated Mobile Money Configuration\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Run auto-configure.js first.');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Update M-Pesa configuration with better structure
if (envContent.includes('MPESA_CONSUMER_KEY=""')) {
  console.log('📝 M-Pesa: Ready for configuration');
  console.log('   → Register at: https://developer.safaricom.co.ke');
  console.log('   → Get Consumer Key, Secret, and Passkey');
  console.log('   → Business Short Code: 174379 (sandbox)\n');
}

// Update Airtel Money configuration
if (envContent.includes('AIRTEL_CLIENT_ID=""')) {
  console.log('📝 Airtel Money: Ready for configuration');
  console.log('   → Register at: https://developer.airtel.africa');
  console.log('   → Get Client ID, Secret, and Merchant ID\n');
}

// Update MTN Mobile Money configuration
if (envContent.includes('MTN_SUBSCRIPTION_KEY=""')) {
  console.log('📝 MTN Mobile Money: Ready for configuration');
  console.log('   → Register at: https://momodeveloper.mtn.com');
  console.log('   → Get Subscription Key\n');
}

// Ensure all are set to sandbox
envContent = envContent.replace(/MPESA_ENVIRONMENT=.*/, 'MPESA_ENVIRONMENT="sandbox"');
envContent = envContent.replace(/AIRTEL_ENVIRONMENT=.*/, 'AIRTEL_ENVIRONMENT="sandbox"');
envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, 'MTN_ENVIRONMENT="sandbox"');

// Save updated .env
fs.writeFileSync(envPath, envContent);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Configuration structure ready!\n');
console.log('📋 To complete setup:\n');
console.log('Option 1: Interactive Setup (Recommended)');
console.log('  Run: node backend/setup-mobile-money.js\n');
console.log('Option 2: Manual Setup');
console.log('  1. Register with each service (links above)');
console.log('  2. Get your credentials');
console.log('  3. Edit backend/.env and add them\n');
console.log('Option 3: Use Test/Sandbox Credentials');
console.log('  All services offer sandbox environments for testing');
console.log('  You can get test credentials from their developer portals\n');
console.log('💡 For development, you can skip these and configure later.');
console.log('   The backend will work fine without them.\n');

