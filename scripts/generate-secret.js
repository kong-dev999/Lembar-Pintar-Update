#!/usr/bin/env node

/**
 * Generate NEXTAUTH_SECRET for production
 *
 * Usage:
 *   node scripts/generate-secret.js
 *
 * Or make it executable and run:
 *   chmod +x scripts/generate-secret.js
 *   ./scripts/generate-secret.js
 */

const crypto = require('crypto');

function generateSecret() {
  // Generate 32 random bytes and convert to base64
  const secret = crypto.randomBytes(32).toString('base64');
  return secret;
}

function main() {
  console.log('\n🔐 NextAuth Secret Generator\n');
  console.log('═══════════════════════════════════════════════════════════');

  const secret = generateSecret();

  console.log('\nYour generated NEXTAUTH_SECRET:');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`\n${secret}\n`);
  console.log('───────────────────────────────────────────────────────────');

  console.log('\n📝 How to use:');
  console.log('   1. Copy the secret above');
  console.log('   2. Add to AWS Amplify Console → Environment variables:');
  console.log(`      NEXTAUTH_SECRET=${secret}`);
  console.log('   3. Or add to your .env.local file for local development');

  console.log('\n✅ Keep this secret safe and never commit it to git!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main();