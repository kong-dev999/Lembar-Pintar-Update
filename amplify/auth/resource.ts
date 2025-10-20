/**
 * Auth Resource - Reference to Existing Cognito User Pool
 *
 * This file references the manually created Cognito User Pool
 * instead of creating a new one via defineAuth()
 *
 * Pool ID: ap-southeast-2_k2dfYv2Ct
 * Region: ap-southeast-2
 */

/**
 * NOTE: Since we're using an existing Cognito User Pool,
 * we don't use defineAuth() which would create a new pool.
 *
 * Instead, the configuration is loaded from amplify_outputs.json
 * which contains the existing pool credentials.
 *
 * If you want to create a NEW pool instead, uncomment below:
 *
 * import { defineAuth } from '@aws-amplify/backend';
 *
 * export const auth = defineAuth({
 *   loginWith: {
 *     email: true,
 *   },
 *   userAttributes: {
 *     email: {
 *       required: true,
 *       mutable: false,
 *     },
 *     name: {
 *       required: false,
 *       mutable: true,
 *     },
 *   },
 * });
 */

// Export empty auth config - using existing pool
export const auth = {
  type: 'existing',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
} as const;
