/**
 * Unified Auth Interface
 * Automatically switches between NextAuth and Cognito based on environment
 */

import { getAuthProvider, AUTH_PROVIDERS, isCognito, isNextAuth } from './config';
import {
  signInWithCognito,
  signUpWithCognito,
  signOutFromCognito,
  getCurrentCognitoUser,
  confirmSignUpWithCognito,
  resendVerificationCode,
  resetPasswordWithCognito,
  confirmPasswordResetWithCognito,
} from './cognito';

/**
 * Unified sign in
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signIn = async (email, password) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return signInWithCognito(email, password);
  }

  // For NextAuth, we use the built-in signIn from next-auth/react
  // This should be called from the client side
  throw new Error('NextAuth sign in should use next-auth/react signIn() on client side');
};

/**
 * Unified sign up
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const signUp = async (email, password, name) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return signUpWithCognito(email, password, name);
  }

  // For NextAuth, registration is handled by your API route
  throw new Error('NextAuth sign up should use your custom API route');
};

/**
 * Unified sign out
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOut = async () => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return signOutFromCognito();
  }

  // For NextAuth, we use the built-in signOut from next-auth/react
  throw new Error('NextAuth sign out should use next-auth/react signOut() on client side');
};

/**
 * Get current authenticated user
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const getCurrentUser = async () => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return getCurrentCognitoUser();
  }

  // For NextAuth, use useSession() hook or getSession() from next-auth/react
  throw new Error('NextAuth user should use useSession() hook or getSession() on client side');
};

/**
 * Confirm sign up (Cognito only)
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const confirmSignUp = async (email, code) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return confirmSignUpWithCognito(email, code);
  }

  // NextAuth doesn't need confirmation
  return { success: true, message: 'No confirmation needed' };
};

/**
 * Resend verification code (Cognito only)
 * @param {string} email
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const resendCode = async (email) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return resendVerificationCode(email);
  }

  return { success: false, error: 'Not supported with NextAuth' };
};

/**
 * Reset password
 * @param {string} email
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const resetPassword = async (email) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return resetPasswordWithCognito(email);
  }

  throw new Error('NextAuth password reset should use your custom API route');
};

/**
 * Confirm password reset (Cognito only)
 * @param {string} email
 * @param {string} code
 * @param {string} newPassword
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const confirmPasswordReset = async (email, code, newPassword) => {
  const provider = getAuthProvider();

  if (provider === AUTH_PROVIDERS.COGNITO) {
    return confirmPasswordResetWithCognito(email, code, newPassword);
  }

  throw new Error('NextAuth password reset should use your custom API route');
};

// Export utilities
export { getAuthProvider, AUTH_PROVIDERS, isCognito, isNextAuth };
