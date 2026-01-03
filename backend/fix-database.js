#!/usr/bin/env node

/**
 * Fix Database Configuration
 * Updates DATABASE_URL with correct PostgreSQL credentials
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n🔧 Fixing Database Configuration\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Run auto-configure.js first.');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Database credentials (from earlier setup)
const dbConfig = {
  user: 'arisegenius_user',
  password: 'arisegenius_password',
  host: 'localhost',
  port: '5432',
  database: 'arisegenius_db',
  schema: 'public'
};

const newDatabaseUrl = `DATABASE_URL="postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?schema=${dbConfig.schema}"`;

// Replace DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
  envContent = envContent.replace(/DATABASE_URL="[^"]*"/, newDatabaseUrl);
  console.log('✅ Updated DATABASE_URL');
} else {
  // Add if it doesn't exist
  envContent = `DATABASE_URL=${newDatabaseUrl}\n${envContent}`;
  console.log('✅ Added DATABASE_URL');
}

// Save updated .env
fs.writeFileSync(envPath, envContent);

console.log('\n📝 Database Configuration:');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log('\n✅ Database configuration updated!');
console.log('\n⚠️  Make sure PostgreSQL is running and the database exists.');
console.log('   If the database doesn\'t exist, run:');
console.log('   npm run migrate\n');

