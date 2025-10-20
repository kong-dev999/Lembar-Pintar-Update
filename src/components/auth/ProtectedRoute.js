/**
 * Protected Route Component for Cognito
 * Client-side protection since Cognito tokens are in localStorage
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isCognito } from '@/lib/auth/config';
import { useSession } from 'next-auth/react';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const router = useRouter();
  const useCognito = isCognito();
  const { data: session, status } = useSession(); // For NextAuth
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (useCognito) {
        // Cognito: Check localStorage tokens
        const idToken = localStorage.getItem('cognito_id_token');

        if (!idToken) {
          router.replace('/auth/login');
          return;
        }

        // Decode token to check role
        try {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          const userRole = payload['custom:role'] || 'USER';

          // Check if admin required
          if (requireAdmin && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            router.replace('/403');
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          console.error('Invalid token:', error);
          router.replace('/auth/login');
        }
      } else {
        // NextAuth: Use session from hook
        if (status === 'loading') {
          return; // Still loading
        }

        if (!session) {
          router.replace('/auth/login');
          return;
        }

        // Check role for admin routes
        if (requireAdmin && session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
          router.replace('/403');
          return;
        }

        setIsAuthorized(true);
      }

      setIsLoading(false);
    }

    checkAuth();
  }, [useCognito, session, status, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirecting...
  }

  return <>{children}</>;
}
