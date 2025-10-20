import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import PolotnoEditor
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

export default function EditDesignPage({ user }) {
    const { user: authUser } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    const [designData, setDesignData] = useState(null);

    // Use user from props if available, fallback to auth context
    const effectiveUser = user || authUser;

    useEffect(() => {
        // Load design data jika ID tersedia
        if (id) {
            loadDesignData(id);
        }
    }, [id]);

    const loadDesignData = async (designId) => {
        try {
            // TODO: Fetch dari API
            // const response = await fetch(`/api/designs/${designId}`);
            // const data = await response.json();
            // setDesignData(data);

            // Sementara dari localStorage
            const saved = localStorage.getItem(`polotno-design-${designId}`);
            if (saved) {
                setDesignData(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading design:', error);
        }
    };

    return (
        <div className="h-screen w-full">
            <PolotnoEditor userSession={effectiveUser} designId={id} initialData={designData} />
        </div>
    );
}

// Disable layout untuk full-screen editor
EditDesignPage.getLayout = function getLayout(page) {
    return page;
};