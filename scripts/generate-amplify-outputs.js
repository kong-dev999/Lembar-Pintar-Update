#!/usr/bin/env node
/**
 * Generate amplify_outputs.json from environment variables
 *
 * This script runs during build time in AWS Amplify to create
 * the amplify_outputs.json file from environment variables.
 *
 * This is necessary because:
 * 1. We're using an existing Cognito User Pool (not creating new)
 * 2. Credentials are stored in Amplify environment variables
 * 3. amplify_outputs.json is gitignored (for security)
 *
 * Usage: node scripts/generate-amplify-outputs.js
 */

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Generating amplify_outputs.json...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check if we're using Cognito
const authProvider = process.env.AUTH_PROVIDER || process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'nextauth';

console.log('📌 Current AUTH_PROVIDER:', authProvider);
console.log('');

if (authProvider.toLowerCase() !== 'cognito') {
  console.log('⏭️  Skipping: Not using Cognito auth');
  console.log('   Set AUTH_PROVIDER=cognito to enable');
  console.log('');
  process.exit(0);
}

// Get Cognito credentials from environment
const config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
};

console.log('📋 Environment Variables Check:');
console.log('   NEXT_PUBLIC_AWS_REGION:', config.region ? '✅' : '❌ NOT SET');
console.log('   NEXT_PUBLIC_COGNITO_USER_POOL_ID:', config.userPoolId ? '✅' : '❌ NOT SET');
console.log('   NEXT_PUBLIC_COGNITO_CLIENT_ID:', config.clientId ? '✅' : '❌ NOT SET');
console.log('');

// Validate required variables
const missing = [];
if (!config.region) missing.push('NEXT_PUBLIC_AWS_REGION');
if (!config.userPoolId) missing.push('NEXT_PUBLIC_COGNITO_USER_POOL_ID');
if (!config.clientId) missing.push('NEXT_PUBLIC_COGNITO_CLIENT_ID');

if (missing.length > 0) {
  console.error('❌ ERROR: Missing required environment variables!');
  console.error('');
  console.error('   Required variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('');
  console.error('💡 Solution:');
  console.error('   1. Go to AWS Amplify Console');
  console.error('   2. Select your app → Environment variables');
  console.error('   3. Add the missing variables');
  console.error('   4. Redeploy your app');
  console.error('');
  process.exit(1);
}

// Create amplify_outputs.json structure
const amplifyOutputs = {
  version: '1',
  auth: {
    aws_region: config.region,
    user_pool_id: config.userPoolId,
    user_pool_client_id: config.clientId,
    identity_pool_id: config.identityPoolId,
    password_policy: {
      min_length: 8,
      require_lowercase: true,
      require_uppercase: true,
      require_numbers: true,
      require_symbols: true,
    },
    oauth: {},
    username_attributes: ['email'],
    standard_required_attributes: ['email'],
    user_verification_types: ['email'],
    mfa_configuration: 'OFF',
    mfa_methods: [],
  },
};

// Write to root directory
const outputPath = path.join(process.cwd(), 'amplify_outputs.json');

try {
  fs.writeFileSync(outputPath, JSON.stringify(amplifyOutputs, null, 2), 'utf-8');
  console.log('✅ SUCCESS: amplify_outputs.json generated!');
  console.log('');
  console.log('📄 Configuration:');
  console.log(`   Region:        ${config.region}`);
  console.log(`   User Pool ID:  ${config.userPoolId}`);
  console.log(`   Client ID:     ${config.clientId.substring(0, 10)}...`);
  console.log(`   File location: ${outputPath}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Ready to deploy!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
} catch (error) {
  console.error('❌ ERROR: Failed to write amplify_outputs.json');
  console.error('');
  console.error('   Error message:', error.message);
  console.error('   File path:', outputPath);
  console.error('');
  process.exit(1);
}
