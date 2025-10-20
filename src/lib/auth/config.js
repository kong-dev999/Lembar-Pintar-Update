/**
 * Auth Configuration
 * Detects which auth provider to use based on environment
 */

export const AUTH_PROVIDERS = {
  NEXTAUTH: 'nextauth',
  COGNITO: 'cognito',
};

// Get current auth provider from environment
export const getAuthProvider = () => {
  const provider = process.env.AUTH_PROVIDER || process.env.NEXT_PUBLIC_AUTH_PROVIDER;

  console.log('🔍 Auth Provider Debug:', {
    AUTH_PROVIDER: process.env.AUTH_PROVIDER,
    NEXT_PUBLIC_AUTH_PROVIDER: process.env.NEXT_PUBLIC_AUTH_PROVIDER,
    provider,
    NODE_ENV: process.env.NODE_ENV
  });

  // FORCE COGNITO: Always use Cognito (comment this line to go back to env-based)
  return AUTH_PROVIDERS.COGNITO;

  // Default to NextAuth for development, Cognito for production
  // if (!provider) {
  //   return process.env.NODE_ENV === 'production'
  //     ? AUTH_PROVIDERS.COGNITO
  //     : AUTH_PROVIDERS.NEXTAUTH;
  // }

  // return provider.toLowerCase();
};

// Check if using Cognito
export const isCognito = () => {
  return getAuthProvider() === AUTH_PROVIDERS.COGNITO;
};

// Check if using NextAuth
export const isNextAuth = () => {
  return getAuthProvider() === AUTH_PROVIDERS.NEXTAUTH;
};

// Load Cognito configuration from amplify_outputs.json or environment variables
const loadCognitoConfig = () => {
  // Priority 1: Try loading from amplify_outputs.json (for Amplify hosting)
  try {
    const amplifyOutputs = require('../../../amplify_outputs.json');
    if (amplifyOutputs?.auth) {
      return {
        region: amplifyOutputs.auth.aws_region,
        userPoolId: amplifyOutputs.auth.user_pool_id,
        userPoolClientId: amplifyOutputs.auth.user_pool_client_id,
        clientSecret: process.env.COGNITO_CLIENT_SECRET,
      };
    }
  } catch (error) {
    // File not found or parse error, fall back to env vars
  }

  // Priority 2: Fall back to environment variables (for local dev)
  // Use server-side env vars (no NEXT_PUBLIC_ prefix needed)
  return {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    userPoolId: process.env.COGNITO_USER_POOL_ID || 'ap-southeast-2_k2dfYv2Ct',
    userPoolClientId: process.env.COGNITO_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
  };
};

// Cognito configuration
export const cognitoConfig = loadCognitoConfig();

// Validate Cognito configuration
export const validateCognitoConfig = () => {
  const required = ['region', 'userPoolId', 'userPoolClientId'];
  const missing = required.filter(key => !cognitoConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Cognito configuration: ${missing.join(', ')}. ` +
      `Please set the following environment variables: ` +
      missing.map(key => {
        const envKey = {
          region: 'NEXT_PUBLIC_AWS_REGION',
          userPoolId: 'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
          userPoolClientId: 'NEXT_PUBLIC_COGNITO_CLIENT_ID',
        }[key];
        return envKey;
      }).join(', ')
    );
  }

  return true;
};
