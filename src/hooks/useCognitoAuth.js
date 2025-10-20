/**
 * Cognito Auth Hook - Replace NextAuth
 * For AWS Amplify Gen 2 Production
 */

import { useState, useEffect } from 'react';
import {
  getCurrentUser,
  fetchAuthSession,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';

export function useCognitoAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    // Skip auth check during SSR (build time)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      const authSession = await fetchAuthSession();

      // Decode ID token to get user info
      const idToken = authSession.tokens?.idToken?.toString();

      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1]));

        // Get role from database (localStorage cache)
        const cachedRole = localStorage.getItem('user_role') || 'USER';

        setUser({
          id: currentUser.userId,
          email: payload.email,
          name: payload.name || payload.email?.split('@')[0],
          role: cachedRole,
        });

        setSession({
          user: {
            id: currentUser.userId,
            email: payload.email,
            name: payload.name || payload.email?.split('@')[0],
            role: cachedRole,
          },
          accessToken: authSession.tokens?.accessToken?.toString(),
          idToken: authSession.tokens?.idToken?.toString(),
        });
      }
    } catch (error) {
      console.log('Not authenticated:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut(redirectTo = '/auth/login') {
    // Skip on SSR
    if (typeof window === 'undefined') return;

    try {
      await amplifySignOut({ global: true });

      // Clear all tokens and cache
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_refresh_token');
      localStorage.removeItem('user_role');

      setUser(null);
      setSession(null);

      // Redirect to provided target
      if (redirectTo) window.location.href = redirectTo;
    } catch (error) {
      console.error('Sign out error:', error);

      // Force clear even if error
      localStorage.clear();
      if (redirectTo) window.location.href = redirectTo;
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}

export default useCognitoAuth;
