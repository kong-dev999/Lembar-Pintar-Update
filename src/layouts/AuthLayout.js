import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');

    if (!loading && isAuthenticated) {
      router.push('/account');
    }
  }, [setTheme, loading, isAuthenticated, router]);

  if (loading) return <></>;
  return (
    <main className="relative flex flex-col items-center justify-center h-screen p-10 space-y-10">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      {children}
    </main>
  );
};

export default AuthLayout;
