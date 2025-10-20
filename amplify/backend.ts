/**
 * Amplify Backend Configuration
 *
 * This file defines the backend resources for this application.
 * Since we're using existing Cognito User Pool and Prisma for database,
 * this is a minimal configuration.
 */

import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Since we're using:
 * - Existing Cognito User Pool (not creating new)
 * - Prisma for database (not Amplify Data)
 *
 * This backend config is minimal and mainly for:
 * 1. Generating amplify_outputs.json
 * 2. Maintaining Amplify Gen 2 structure
 * 3. Future extensibility
 */

// Only include auth in backend definition
// Data is excluded since we use Prisma
defineBackend({
  // Auth is referenced but not created
  // (using existing Cognito pool)
});

// Export for potential future use
export { auth, data };
