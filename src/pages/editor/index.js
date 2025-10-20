import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';

// Import PolotnoEditor dengan dynamic import untuk menghindari SSR issues
const PolotnoEditor = dynamic(() => import('@/components/editor/PolotnoEditor'), {
    ssr: false,
    loading: () => (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading Editor...</p>
            </div>
        </div>
    ),
});

function EditorPage({ user }) {
    const { user: cognitoUser, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Use user from props (HOC) or fallback to Cognito user
    const effectiveUser = user || cognitoUser;

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [loading, isAuthenticated, router]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen w-full">
            <PolotnoEditor userSession={{ user: effectiveUser }} image={router.query.image} />
        </div>
    );
}

// Export default component
export default EditorPage;

// Disable default layout for full-screen editor
EditorPage.getLayout = function getLayout(page) {
    return page;
};

// No getServerSideProps needed - auth handled client-side with Cognito