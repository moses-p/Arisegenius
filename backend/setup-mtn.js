#!/usr/bin/env node

/**
 * MTN Mobile Money Setup
 * Step-by-step guide to configure MTN Mobile Money
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

async function setupMTN() {
  console.log('\n📱 MTN Mobile Money Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Run auto-configure.js first.');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  console.log('📋 Step-by-Step Setup:\n');
  console.log('1. Register at MTN Developer Portal');
  console.log('2. Create a product');
  console.log('3. Get your Subscription Key');
  console.log('4. Enter it below\n');

  const openPortal = await question('Open MTN Developer Portal in browser? (y/n): ');
  if (openPortal.toLowerCase() === 'y') {
    console.log('\n🌐 Opening: https://momodeveloper.mtn.com\n');
    openURL('https://momodeveloper.mtn.com');
    console.log('Please complete these steps:');
    console.log('  1. Sign up/Login to MTN Developer Portal');
    console.log('  2. Go to "Products" section');
    console.log('  3. Create a new product or select existing one');
    console.log('  4. Copy your "Subscription Key"\n');
    console.log('Press Enter when you have your Subscription Key...');
    await question('');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Enter Your MTN Mobile Money Credentials\n');

  const subscriptionKey = await question('MTN Subscription Key: ');
  if (!subscriptionKey || subscriptionKey.trim() === '') {
    console.log('\n⚠️  No subscription key provided. Setup cancelled.');
    rl.close();
    return;
  }

  const environment = await question('Environment (sandbox/production, default: sandbox): ');
  const env = (environment && environment.trim()) ? environment.trim().toLowerCase() : 'sandbox';

  if (env !== 'sandbox' && env !== 'production') {
    console.log('⚠️  Invalid environment. Using "sandbox"');
    env = 'sandbox';
  }

  // Update .env file
  envContent = envContent.replace(/MTN_SUBSCRIPTION_KEY=.*/, `MTN_SUBSCRIPTION_KEY="${subscriptionKey.trim()}"`);
  envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, `MTN_ENVIRONMENT="${env}"`);

  // Save updated .env
  fs.writeFileSync(envPath, envContent);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ MTN Mobile Money Configuration Saved!\n');
  console.log('📝 Configuration:');
  console.log(`   Subscription Key: ${subscriptionKey.substring(0, 20)}...`);
  console.log(`   Environment: ${env}\n`);
  console.log('🔄 Next Steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Check console output - you should see:');
  console.log('      - MTN Mobile Money: ✅ Configured\n');
  console.log('💡 For testing, use sandbox environment first.');
  console.log('   Switch to production when ready for live payments.\n');

  rl.close();
}

setupMTN().catch(console.error);

