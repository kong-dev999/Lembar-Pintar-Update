/**
 * Higher-Order Component for Admin Authentication
 * Wraps admin pages to enforce authentication and role checking
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export function withAdminAuth(Component) {
  return function AdminProtectedPage(props) {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (!loading) {
        // Check if user is authenticated
        if (!isAuthenticated) {
          router.replace('/auth/login');
          return;
        }

        // Check if user has admin role
        const userRole = user?.role?.toUpperCase();
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          router.replace('/403'); // Forbidden page
          return;
        }

        setIsAuthorized(true);
      }
    }, [loading, isAuthenticated, user, router]);

    // Show loading while checking auth
    if (loading || !isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // User is authenticated and authorized - render component
    return <Component {...props} user={user} />;
  };
}

export default withAdminAuth;
