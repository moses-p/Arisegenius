import { PrismaClient } from '@prisma/client';

const commonPasswords = ['postgres', '', 'admin', 'root', 'password', '123456', 'postgres123'];

async function tryConnect(password: string): Promise<PrismaClient | null> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://postgres:${password}@localhost:5432/postgres?schema=public`
      }
    }
  });
  
  try {
    await prisma.$connect();
    return prisma;
  } catch {
    await prisma.$disconnect().catch(() => {});
    return null;
  }
}

async function setupDatabase() {
  console.log('🔧 Setting up Arisegenius database...\n');
  console.log('🔍 Trying to connect to PostgreSQL...\n');
  
  let prisma: PrismaClient | null = null;
  let connected = false;
  
  for (const password of commonPasswords) {
    const pwdDisplay = password || '(empty)';
    process.stdout.write(`   Trying password: ${pwdDisplay}... `);
    prisma = await tryConnect(password);
    if (prisma) {
      console.log('✅ Connected!\n');
      connected = true;
      break;
    } else {
      console.log('❌');
    }
  }
  
  if (!connected) {
    console.error('\n❌ Could not connect to PostgreSQL with any common passwords.');
    console.error('   Please run the SQL script manually using pgAdmin:');
    console.error('   1. Open pgAdmin');
    console.error('   2. Connect to your PostgreSQL server');
    console.error('   3. Right-click on Databases -> Query Tool');
    console.error('   4. Open setup-database.sql and execute it\n');
    process.exit(1);
  }
  
  if (!prisma) {
    console.error('❌ No database connection available');
    process.exit(1);
  }
  
  try {
    // Check if user exists
    const userCheck = await prisma.$queryRaw`
      SELECT 1 FROM pg_roles WHERE rolname = 'arisegenius_user'
    ` as any[];
    
    if (userCheck.length === 0) {
      await prisma.$executeRawUnsafe(`
        CREATE USER arisegenius_user WITH PASSWORD 'arisegenius_password';
      `);
      console.log('✅ Created user: arisegenius_user');
    } else {
      console.log('⚠️  User arisegenius_user already exists');
    }
    
    // Check if database exists
    const dbCheck = await prisma.$queryRaw`
      SELECT 1 FROM pg_database WHERE datname = 'arisegenius_db'
    ` as any[];
    
    if (dbCheck.length === 0) {
      await prisma.$executeRawUnsafe(`
        CREATE DATABASE arisegenius_db OWNER arisegenius_user;
      `);
      console.log('✅ Created database: arisegenius_db');
    } else {
      console.log('⚠️  Database arisegenius_db already exists');
    }
    
    // Grant privileges
    await prisma.$executeRawUnsafe(`
      GRANT ALL PRIVILEGES ON DATABASE arisegenius_db TO arisegenius_user;
    `);
    console.log('✅ Granted database privileges');
    
    // Connect to new database for schema privileges
    await prisma.$disconnect();
    
    const newPrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://arisegenius_user:arisegenius_password@localhost:5432/arisegenius_db?schema=public'
        }
      }
    });
    
    await newPrisma.$connect();
    console.log('✅ Connected to arisegenius_db');
    
    await newPrisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO arisegenius_user');
    await newPrisma.$executeRawUnsafe('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO arisegenius_user');
    await newPrisma.$executeRawUnsafe('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO arisegenius_user');
    
    console.log('✅ Granted schema privileges');
    
    await newPrisma.$disconnect();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('   User: arisegenius_user');
    console.log('   Database: arisegenius_db');
    console.log('   Password: arisegenius_password\n');
    
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Some objects already exist, but continuing...');
    } else {
      console.error('❌ Error setting up database:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

