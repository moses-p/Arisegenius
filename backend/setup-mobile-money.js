#!/usr/bin/env node

/**
 * Automated Mobile Money Payment Gateway Setup
 * Helps configure M-Pesa, Airtel Money, and MTN Mobile Money
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function openURL(url) {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      execSync(`start ${url}`, { stdio: 'ignore' });
    } else if (platform === 'darwin') {
      execSync(`open ${url}`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open ${url}`, { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function setupMobileMoney() {
  console.log('\n💳 Mobile Money Payment Gateway Setup\n');
  console.log('This will help you configure M-Pesa, Airtel Money, and MTN Mobile Money.\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Run auto-configure.js first.');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // M-Pesa Setup
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. M-PESA (Safaricom - Kenya)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const setupMpesa = await question('Configure M-Pesa? (y/n): ');
  if (setupMpesa.toLowerCase() === 'y') {
    console.log('\n📋 M-Pesa Setup Steps:');
    console.log('   1. Register at: https://developer.safaricom.co.ke');
    console.log('   2. Create an app in the developer portal');
    console.log('   3. Get your Consumer Key and Consumer Secret');
    console.log('   4. For sandbox, use Business Short Code: 174379\n');
    
    const openMpesa = await question('Open M-Pesa developer portal in browser? (y/n): ');
    if (openMpesa.toLowerCase() === 'y') {
      openURL('https://developer.safaricom.co.ke');
      console.log('✅ Opened browser. Please register/login and create an app.\n');
    }

    const mpesaKey = await question('M-Pesa Consumer Key: ');
    if (mpesaKey) {
      envContent = envContent.replace(/MPESA_CONSUMER_KEY=.*/, `MPESA_CONSUMER_KEY="${mpesaKey}"`);
    }

    const mpesaSecret = await question('M-Pesa Consumer Secret: ');
    if (mpesaSecret) {
      envContent = envContent.replace(/MPESA_CONSUMER_SECRET=.*/, `MPESA_CONSUMER_SECRET="${mpesaSecret}"`);
    }

    const mpesaPasskey = await question('M-Pesa Passkey (from developer portal): ');
    if (mpesaPasskey) {
      envContent = envContent.replace(/MPESA_PASSKEY=.*/, `MPESA_PASSKEY="${mpesaPasskey}"`);
    }

    const mpesaEnv = await question('Environment (sandbox/production, default: sandbox): ');
    if (mpesaEnv) {
      envContent = envContent.replace(/MPESA_ENVIRONMENT=.*/, `MPESA_ENVIRONMENT="${mpesaEnv}"`);
    } else {
      envContent = envContent.replace(/MPESA_ENVIRONMENT=.*/, `MPESA_ENVIRONMENT="sandbox"`);
    }

    console.log('✅ M-Pesa configuration saved!\n');
  }

  // Airtel Money Setup
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. AIRTEL MONEY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const setupAirtel = await question('Configure Airtel Money? (y/n): ');
  if (setupAirtel.toLowerCase() === 'y') {
    console.log('\n📋 Airtel Money Setup Steps:');
    console.log('   1. Register at: https://developer.airtel.africa');
    console.log('   2. Create an application');
    console.log('   3. Get Client ID, Client Secret, and Merchant ID\n');
    
    const openAirtel = await question('Open Airtel developer portal in browser? (y/n): ');
    if (openAirtel.toLowerCase() === 'y') {
      openURL('https://developer.airtel.africa');
      console.log('✅ Opened browser. Please register/login and create an app.\n');
    }

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
    } else {
      envContent = envContent.replace(/AIRTEL_ENVIRONMENT=.*/, `AIRTEL_ENVIRONMENT="sandbox"`);
    }

    console.log('✅ Airtel Money configuration saved!\n');
  }

  // MTN Mobile Money Setup
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. MTN MOBILE MONEY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const setupMTN = await question('Configure MTN Mobile Money? (y/n): ');
  if (setupMTN.toLowerCase() === 'y') {
    console.log('\n📋 MTN Mobile Money Setup Steps:');
    console.log('   1. Register at: https://momodeveloper.mtn.com');
    console.log('   2. Create a product and get Subscription Key\n');
    
    const openMTN = await question('Open MTN developer portal in browser? (y/n): ');
    if (openMTN.toLowerCase() === 'y') {
      openURL('https://momodeveloper.mtn.com');
      console.log('✅ Opened browser. Please register/login and create a product.\n');
    }

    const mtnKey = await question('MTN Subscription Key: ');
    if (mtnKey) {
      envContent = envContent.replace(/MTN_SUBSCRIPTION_KEY=.*/, `MTN_SUBSCRIPTION_KEY="${mtnKey}"`);
    }

    const mtnEnv = await question('Environment (sandbox/production, default: sandbox): ');
    if (mtnEnv) {
      envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, `MTN_ENVIRONMENT="${mtnEnv}"`);
    } else {
      envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, `MTN_ENVIRONMENT="sandbox"`);
    }

    console.log('✅ MTN Mobile Money configuration saved!\n');
  }

  // Save updated .env
  fs.writeFileSync(envPath, envContent);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Configuration Complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Check console output for payment service status');
  console.log('   3. Test payments in sandbox mode first\n');
  console.log('💡 Note: All services are set to "sandbox" mode for testing.');
  console.log('   Change to "production" when ready for live payments.\n');

  rl.close();
}

setupMobileMoney().catch(console.error);

