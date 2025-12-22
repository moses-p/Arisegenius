/**
 * Pesapal Setup Script
 * Automatically configures Pesapal for MTN and Airtel payments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

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

async function setupPesapal() {
  console.log('\n💳 Pesapal Payment Gateway Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Pesapal handles both MTN Mobile Money and Airtel Money payments.\n');

  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(path.join(__dirname, 'env.example'))) {
    envContent = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
  }

  console.log('📋 Steps to get Pesapal credentials:');
  console.log('   1. Register/Login at: https://developer.pesapal.com');
  console.log('   2. Create a merchant account');
  console.log('   3. Get your Consumer Key and Consumer Secret\n');

  const openPortal = await question('Open Pesapal Developer Portal in browser? (y/n): ');
  if (openPortal.toLowerCase() === 'y') {
    console.log('\n🌐 Opening: https://developer.pesapal.com\n');
    openURL('https://developer.pesapal.com');
    await question('Press Enter after you have your credentials ready...');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Enter Your Pesapal Credentials\n');

  const consumerKey = await question('Pesapal Consumer Key: ');
  if (!consumerKey || !consumerKey.trim()) {
    console.log('\n⚠️  No Consumer Key provided. Setup cancelled.');
    rl.close();
    return;
  }

  const consumerSecret = await question('Pesapal Consumer Secret: ');
  if (!consumerSecret || !consumerSecret.trim()) {
    console.log('\n⚠️  No Consumer Secret provided. Setup cancelled.');
    rl.close();
    return;
  }

  const environment = await question('Environment (sandbox/production, default: sandbox): ') || 'sandbox';
  const apiBaseUrl = await question('API Base URL (default: http://localhost:3000): ') || 'http://localhost:3000';

  // Update or add Pesapal configuration
  if (envContent.includes('PESAPAL_CONSUMER_KEY=')) {
    envContent = envContent.replace(/PESAPAL_CONSUMER_KEY=.*/, `PESAPAL_CONSUMER_KEY="${consumerKey.trim()}"`);
  } else {
    if (!envContent.includes('# Pesapal')) {
      envContent += '\n# Pesapal (for MTN and Airtel Mobile Money)\n';
    }
    envContent += `PESAPAL_CONSUMER_KEY="${consumerKey.trim()}"\n`;
  }

  if (envContent.includes('PESAPAL_CONSUMER_SECRET=')) {
    envContent = envContent.replace(/PESAPAL_CONSUMER_SECRET=.*/, `PESAPAL_CONSUMER_SECRET="${consumerSecret.trim()}"`);
  } else {
    envContent += `PESAPAL_CONSUMER_SECRET="${consumerSecret.trim()}"\n`;
  }

  if (envContent.includes('PESAPAL_ENVIRONMENT=')) {
    envContent = envContent.replace(/PESAPAL_ENVIRONMENT=.*/, `PESAPAL_ENVIRONMENT="${environment}"`);
  } else {
    envContent += `PESAPAL_ENVIRONMENT="${environment}"\n`;
  }

  const callbackUrl = `${apiBaseUrl}/api/v1/payments/pesapal/callback`;
  const ipnUrl = `${apiBaseUrl}/api/v1/payments/pesapal/ipn`;

  if (envContent.includes('PESAPAL_CALLBACK_URL=')) {
    envContent = envContent.replace(/PESAPAL_CALLBACK_URL=.*/, `PESAPAL_CALLBACK_URL="${callbackUrl}"`);
  } else {
    envContent += `PESAPAL_CALLBACK_URL="${callbackUrl}"\n`;
  }

  if (envContent.includes('PESAPAL_IPN_URL=')) {
    envContent = envContent.replace(/PESAPAL_IPN_URL=.*/, `PESAPAL_IPN_URL="${ipnUrl}"`);
  } else {
    envContent += `PESAPAL_IPN_URL="${ipnUrl}"\n`;
  }

  // Ensure default phone numbers are set
  if (!envContent.includes('MTN_DEFAULT_PHONE=')) {
    envContent += '\n# Default phone numbers for Pesapal payments\n';
    envContent += 'MTN_DEFAULT_PHONE="256775538145"\n';
  }
  
  if (!envContent.includes('AIRTEL_DEFAULT_PHONE=')) {
    envContent += 'AIRTEL_DEFAULT_PHONE="256743232445"\n';
  }

  // Save .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Pesapal Configuration Saved!\n');
  console.log('📝 Configuration:');
  console.log(`   Consumer Key: ${consumerKey.substring(0, 20)}...`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Callback URL: ${callbackUrl}`);
  console.log(`   IPN URL: ${ipnUrl}\n`);
  console.log('📱 Default Phone Numbers:');
  console.log('   MTN: +256775538145');
  console.log('   Airtel: +256743232445\n');
  console.log('🔄 Next Steps:');
  console.log('   1. Run: npx prisma generate (to update PaymentProvider enum)');
  console.log('   2. Restart your backend server');
  console.log('   3. Check console output - you should see:');
  console.log('      - Pesapal (MTN & Airtel): ✅ Configured\n');
  console.log('💡 Both MTN and Airtel payments will now go through Pesapal!\n');

  rl.close();
}

setupPesapal().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});


