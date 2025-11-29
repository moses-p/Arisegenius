const { Client } = require('pg');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('🔧 Setting up Arisegenius database...\n');
  
  // Try to get postgres password
  const password = await question('Enter PostgreSQL "postgres" user password (or press Enter to try common defaults): ');
  
  // Common default passwords to try
  const passwordsToTry = password ? [password] : ['postgres', '', 'admin', 'root', 'password'];
  
  let client = null;
  let connected = false;
  
  for (const pwd of passwordsToTry) {
    try {
      client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: pwd,
        database: 'postgres'
      });
      
      await client.connect();
      console.log('✅ Connected to PostgreSQL!\n');
      connected = true;
      break;
    } catch (error) {
      // Try next password
      if (client) {
        await client.end().catch(() => {});
      }
      continue;
    }
  }
  
  if (!connected) {
    console.error('❌ Could not connect to PostgreSQL. Please run the SQL script manually using pgAdmin.');
    rl.close();
    process.exit(1);
  }
  
  try {
    // Read and execute SQL script
    const sql = fs.readFileSync('setup-database.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('\\c'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('create user')) {
        // Check if user exists first
        const userCheck = await client.query(
          "SELECT 1 FROM pg_roles WHERE rolname = 'arisegenius_user'"
        );
        if (userCheck.rows.length > 0) {
          console.log('⚠️  User arisegenius_user already exists, skipping...');
          continue;
        }
      }
      
      if (statement.toLowerCase().includes('create database')) {
        // Check if database exists first
        const dbCheck = await client.query(
          "SELECT 1 FROM pg_database WHERE datname = 'arisegenius_db'"
        );
        if (dbCheck.rows.length > 0) {
          console.log('⚠️  Database arisegenius_db already exists, skipping...');
          continue;
        }
      }
      
      await client.query(statement);
      console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
    }
    
    // Connect to new database and grant schema privileges
    await client.end();
    client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'arisegenius_user',
      password: 'arisegenius_password',
      database: 'arisegenius_db'
    });
    
    await client.connect();
    console.log('✅ Connected to arisegenius_db database');
    
    await client.query('GRANT ALL ON SCHEMA public TO arisegenius_user');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO arisegenius_user');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO arisegenius_user');
    
    console.log('✅ Granted schema privileges');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('   User: arisegenius_user');
    console.log('   Database: arisegenius_db');
    console.log('   Password: arisegenius_password\n');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Some objects already exist, but continuing...');
    } else {
      console.error('❌ Error setting up database:', error.message);
      throw error;
    }
  } finally {
    if (client) {
      await client.end();
    }
    rl.close();
  }
}

setupDatabase().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

