/**
 * AWS Cognito Authentication Implementation
 * For production use with AWS Amplify
 */

import { Amplify } from 'aws-amplify';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';
import { cognitoConfig, validateCognitoConfig } from './config';

// Initialize Amplify with Cognito configuration
let isConfigured = false;

export const configureCognito = () => {
  if (isConfigured) return;

  try {
    validateCognitoConfig();

    // Try to use amplify_outputs.json first, fall back to manual config
    let amplifyConfig;
    try {
      if (typeof window === 'undefined') {
        amplifyConfig = require('../../../amplify_outputs.json');
      } else {
        // Client-side: fetch the file
        // Note: This is sync, so amplify_outputs should be imported at build time
        amplifyConfig = require('../../../amplify_outputs.json');
      }

      if (amplifyConfig) {
        Amplify.configure(amplifyConfig);
        console.log('✅ Cognito configured from amplify_outputs.json');
      }
    } catch (error) {
      // Fall back to manual configuration
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: cognitoConfig.userPoolId,
            userPoolClientId: cognitoConfig.userPoolClientId,
            region: cognitoConfig.region,
          },
        },
      });
      console.log('✅ Cognito configured from environment variables');
    }

    isConfigured = true;
  } catch (error) {
    console.error('❌ Failed to configure Cognito:', error.message);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithCognito = async (email, password) => {
  try {
    configureCognito();

    // Check if user is already signed in
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        console.log('User already signed in, signing out first...');
        // Sign out current user first
        await amplifySignOut({ global: true });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cognito_access_token');
          localStorage.removeItem('cognito_id_token');
          localStorage.removeItem('cognito_refresh_token');
        }
      }
    } catch (e) {
      // User not signed in, continue with sign in
      console.log('No existing session, proceeding with sign in');
    }

    const { isSignedIn, nextStep } = await amplifySignIn({
      username: email,
      password,
    });

    if (isSignedIn) {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      return {
        success: true,
        user: {
          id: user.userId,
          email: email,
          username: user.username,
        },
        session: {
          accessToken: session.tokens?.accessToken?.toString(),
          idToken: session.tokens?.idToken?.toString(),
        },
      };
    }

    // Handle MFA or other next steps
    return {
      success: false,
      nextStep,
      error: 'Additional authentication steps required',
    };
  } catch (error) {
    console.error('Cognito sign in error:', error);

    // If error is "UserAlreadyAuthenticatedException", try to sign out and retry once
    if (error.name === 'UserAlreadyAuthenticatedException') {
      console.log('Attempting to clear existing session...');
      try {
        await amplifySignOut({ global: true });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cognito_access_token');
          localStorage.removeItem('cognito_id_token');
          localStorage.removeItem('cognito_refresh_token');
        }

        return {
          success: false,
          error: 'Session cleared. Please try logging in again.',
          shouldRetry: true,
        };
      } catch (signOutError) {
        console.error('Failed to clear session:', signOutError);
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to sign in',
    };
  }
};

/**
 * Sign up new user
 */
export const signUpWithCognito = async (email, password, name) => {
  try {
    configureCognito();

    const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: name || email.split('@')[0],
        },
        autoSignIn: true,
      },
    });

    return {
      success: true,
      isSignUpComplete,
      userId,
      nextStep,
      message: 'Please check your email to verify your account',
    };
  } catch (error) {
    console.error('Cognito sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign up',
    };
  }
};

/**
 * Confirm sign up with verification code
 */
export const confirmSignUpWithCognito = async (email, code) => {
  try {
    configureCognito();

    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return {
      success: true,
      isSignUpComplete,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('Cognito confirm sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify email',
    };
  }
};

/**
 * Resend verification code
 */
export const resendVerificationCode = async (email) => {
  try {
    configureCognito();

    await resendSignUpCode({
      username: email,
    });

    return {
      success: true,
      message: 'Verification code sent',
    };
  } catch (error) {
    console.error('Cognito resend code error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend code',
    };
  }
};

/**
 * Sign out
 */
export const signOutFromCognito = async () => {
  try {
    configureCognito();

    // Sign out with global option to clear all devices
    await amplifySignOut({ global: true });

    // Clear localStorage tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_refresh_token');
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    console.error('Cognito sign out error:', error);

    // Even if sign out fails, clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_refresh_token');
    }

    return {
      success: false,
      error: error.message || 'Failed to sign out',
    };
  }
};

/**
 * Get current user
 */
export const getCurrentCognitoUser = async () => {
  try {
    configureCognito();

    const user = await getCurrentUser();
    const session = await fetchAuthSession();

    return {
      success: true,
      user: {
        id: user.userId,
        username: user.username,
        email: user.signInDetails?.loginId,
      },
      session: {
        accessToken: session.tokens?.accessToken?.toString(),
        idToken: session.tokens?.idToken?.toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Not authenticated',
    };
  }
};

/**
 * Reset password
 */
export const resetPasswordWithCognito = async (email) => {
  try {
    configureCognito();

    const { nextStep } = await resetPassword({
      username: email,
    });

    return {
      success: true,
      nextStep,
      message: 'Password reset code sent to your email',
    };
  } catch (error) {
    console.error('Cognito reset password error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset password',
    };
  }
};

/**
 * Confirm password reset with code
 */
export const confirmPasswordResetWithCognito = async (email, code, newPassword) => {
  try {
    configureCognito();

    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('Cognito confirm password reset error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset password',
    };
  }
};
