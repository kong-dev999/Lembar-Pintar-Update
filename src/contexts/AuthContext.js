/**
 * Auth Context - Cognito for Production
 * Replace NextAuth SessionProvider
 */

import { createContext, useContext } from 'react';
import useCognitoAuth from '@/hooks/useCognitoAuth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const auth = useCognitoAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    // Return default values instead of throwing error during SSR
    return {
      user: null,
      session: null,
      loading: false,
      signOut: () => { },
      isAuthenticated: false,
    };
  }

  return context;
}

export default AuthContext;
