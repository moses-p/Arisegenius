/**
 * Auto-configure MTN and Airtel Mobile Money
 * Sets up default phone numbers and prepares configuration
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

// Default phone numbers
const MTN_DEFAULT_PHONE = '256775538145'; // +256775538145
const AIRTEL_DEFAULT_PHONE = '256743232445'; // +256743232445

function setupMobileMoney() {
  console.log('\n📱 Auto-Configuring MTN and Airtel Mobile Money\n');
  
  let envContent = '';
  
  // Read existing .env or create from example
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    console.log('✅ Created .env from env.example');
  } else {
    console.log('⚠️  No env.example found, creating basic .env');
    envContent = '';
  }
  
  // Ensure MTN configuration exists
  if (!envContent.includes('MTN_SUBSCRIPTION_KEY')) {
    envContent += '\n# MTN Mobile Money\n';
    envContent += 'MTN_SUBSCRIPTION_KEY="your_mtn_subscription_key"\n';
    envContent += 'MTN_ENVIRONMENT="sandbox"\n';
    envContent += `MTN_DEFAULT_PHONE="${MTN_DEFAULT_PHONE}"\n`;
    console.log('✅ Added MTN configuration');
  } else {
    // Update existing MTN config
    envContent = envContent.replace(/MTN_ENVIRONMENT=.*/, 'MTN_ENVIRONMENT="sandbox"');
    if (!envContent.includes('MTN_DEFAULT_PHONE')) {
      envContent += `MTN_DEFAULT_PHONE="${MTN_DEFAULT_PHONE}"\n`;
    } else {
      envContent = envContent.replace(/MTN_DEFAULT_PHONE=.*/, `MTN_DEFAULT_PHONE="${MTN_DEFAULT_PHONE}"`);
    }
    console.log('✅ Updated MTN configuration');
  }
  
  // Ensure Airtel configuration exists
  if (!envContent.includes('AIRTEL_CLIENT_ID')) {
    envContent += '\n# Airtel Money\n';
    envContent += 'AIRTEL_CLIENT_ID="your_airtel_client_id"\n';
    envContent += 'AIRTEL_CLIENT_SECRET="your_airtel_client_secret"\n';
    envContent += 'AIRTEL_MERCHANT_ID="your_airtel_merchant_id"\n';
    envContent += 'AIRTEL_ENVIRONMENT="sandbox"\n';
    envContent += `AIRTEL_DEFAULT_PHONE="${AIRTEL_DEFAULT_PHONE}"\n`;
    console.log('✅ Added Airtel configuration');
  } else {
    // Update existing Airtel config
    envContent = envContent.replace(/AIRTEL_ENVIRONMENT=.*/, 'AIRTEL_ENVIRONMENT="sandbox"');
    if (!envContent.includes('AIRTEL_DEFAULT_PHONE')) {
      envContent += `AIRTEL_DEFAULT_PHONE="${AIRTEL_DEFAULT_PHONE}"\n`;
    } else {
      envContent = envContent.replace(/AIRTEL_DEFAULT_PHONE=.*/, `AIRTEL_DEFAULT_PHONE="${AIRTEL_DEFAULT_PHONE}"`);
    }
    console.log('✅ Updated Airtel configuration');
  }
  
  // Save .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuration saved to .env');
  console.log('\n📋 Default Phone Numbers Configured:');
  console.log(`   MTN: +${MTN_DEFAULT_PHONE}`);
  console.log(`   Airtel: +${AIRTEL_DEFAULT_PHONE}`);
  console.log('\n⚠️  IMPORTANT: You still need to add your API credentials:');
  console.log('   1. MTN_SUBSCRIPTION_KEY - Get from https://momodeveloper.mtn.com');
  console.log('   2. AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_MERCHANT_ID');
  console.log('      Get from https://developer.airtel.africa');
  console.log('\n💡 Once credentials are added, payments will automatically use the default phone numbers');
  console.log('   if no phone number is provided in the payment request.\n');
}

setupMobileMoney();

