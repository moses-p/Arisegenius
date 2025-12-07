#!/usr/bin/env node

/**
 * Auto-configure Arisegenius services
 * Copies email configuration from env.example and sets up defaults
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, 'env.example');

console.log('\n🚀 Arisegenius Auto-Configuration\n');

// Read env.example
if (!fs.existsSync(examplePath)) {
  console.log('❌ env.example not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(examplePath, 'utf8');

// Update PORT to 5000 if it's 3000
envContent = envContent.replace(/PORT=3000/, 'PORT=5000');

// Update CORS to include localhost:5000
if (!envContent.includes('http://localhost:5000')) {
  envContent = envContent.replace(
    /CORS_ORIGIN="([^"]*)"/,
    'CORS_ORIGIN="$1,http://localhost:5000"'
  );
}

// Generate secure random secrets if they're still placeholders
const crypto = require('crypto');

if (envContent.includes('your-super-secret-jwt-key-here')) {
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  envContent = envContent.replace(
    /JWT_SECRET="your-super-secret-jwt-key-here"/,
    `JWT_SECRET="${jwtSecret}"`
  );
}

if (envContent.includes('your-super-secret-refresh-key-here')) {
  const refreshSecret = crypto.randomBytes(32).toString('hex');
  envContent = envContent.replace(
    /JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"/,
    `JWT_REFRESH_SECRET="${refreshSecret}"`
  );
}

if (envContent.includes('your-session-secret-key')) {
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  envContent = envContent.replace(
    /SESSION_SECRET="your-session-secret-key"/,
    `SESSION_SECRET="${sessionSecret}"`
  );
}

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ Configuration complete!\n');
console.log('📧 Email Service:');
console.log('   - SMTP configured from env.example');
console.log('   - Ready to use (if credentials are valid)\n');

console.log('💳 Payment Gateways:');
console.log('   - Stripe: ⚠️  Needs configuration (get keys from https://stripe.com)');
console.log('   - M-Pesa: ⚠️  Needs configuration (get keys from https://developer.safaricom.co.ke)');
console.log('   - Airtel Money: ⚠️  Needs configuration (get keys from https://developer.airtel.africa)');
console.log('   - MTN Mobile Money: ⚠️  Needs configuration (get keys from https://momodeveloper.mtn.com)\n');

console.log('🔐 Security:');
console.log('   - JWT secrets generated automatically');
console.log('   - Session secret generated automatically\n');

console.log('📝 Next Steps:');
console.log('   1. Restart your backend server');
console.log('   2. Email service should work if SMTP credentials are valid');
console.log('   3. Configure payment gateways when ready for production');
console.log('   4. See backend/CONFIGURATION_GUIDE.md for payment setup\n');

