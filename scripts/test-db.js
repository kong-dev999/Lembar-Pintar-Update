#!/usr/bin/env node

/**
 * Test Database Connection
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/test-db.js
 *
 * Or:
 *   node scripts/test-db.js
 *   (will use DATABASE_URL from .env)
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');
  console.log('═══════════════════════════════════════════════════════════');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Get database info
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database Info:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(result);
    console.log('───────────────────────────────────────────────────────────\n');

    // Count tables
    console.log('📋 Checking tables...');
    try {
      const userCount = await prisma.user.count();
      console.log(`   Users: ${userCount}`);

      const assetCount = await prisma.asset.count();
      console.log(`   Assets: ${assetCount}`);

      const workspaceCount = await prisma.workspace.count();
      console.log(`   Workspaces: ${workspaceCount}`);

      console.log('\n✅ All tables accessible!\n');
    } catch (error) {
      console.log('\n⚠️  Tables not found. Run migrations first:');
      console.log('   npx prisma migrate deploy\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.log('───────────────────────────────────────────────────────────');
    console.error('Error:', error.message);
    console.log('───────────────────────────────────────────────────────────');

    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check DATABASE_URL is set correctly');
    console.log('   2. Ensure database server is running');
    console.log('   3. Check firewall/security group allows connections');
    console.log('   4. Verify credentials (username/password)');
    console.log('   5. Check database name exists\n');

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();