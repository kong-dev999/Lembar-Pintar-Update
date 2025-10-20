import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import AdminPolotnoEditor
const AdminPolotnoEditor = dynamic(() => import('@/components/editor/AdminPolotnoEditor'), {
    ssr: false,
    loading: () => (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg">Loading Editor...</p>
            </div>
        </div>
    ),
});

function AdminEditorPage({ user }) {
    const router = useRouter();
    const [designData, setDesignData] = useState(null);
    const { id } = router.query;

    useEffect(() => {
        // Add editor-page class to body for CSS targeting
        document.body.classList.add('editor-page');
        document.documentElement.classList.add('editor-page');

        // Load design data jika ID tersedia
        if (id) {
            loadDesignData(id);
        }

        // Cleanup function to remove classes when leaving editor
        return () => {
            document.body.classList.remove('editor-page');
            document.documentElement.classList.remove('editor-page');
        };
    }, [id]);

    const loadDesignData = async (designId) => {
        console.log('🔍 EDITOR.JS: Starting loadDesignData for designId:', designId);

        try {
            const url = `/api/designs/${designId}`;
            console.log('🔍 EDITOR.JS: Fetching from URL:', url);

            // Load from database
            const response = await fetch(url);
            console.log('🔍 EDITOR.JS: Response status:', response.status);

            const result = await response.json();
            console.log('🔍 EDITOR.JS: API response:', result);

            if (result.success) {
                console.log('✅ EDITOR.JS: Design loaded from database:', result.design.id);
                console.log('✅ EDITOR.JS: PolotnoJson data:', result.design.polotnoJson);
                console.log('✅ EDITOR.JS: Setting designData...');
                setDesignData(result.design.polotnoJson);
                console.log('✅ EDITOR.JS: designData set successfully');
            } else {
                console.error('❌ EDITOR.JS: Design not found:', result.message);
                // Fallback to localStorage
                const saved = localStorage.getItem(`polotno-design-${designId}`);
                if (saved) {
                    console.log('📦 EDITOR.JS: Using localStorage fallback');
                    setDesignData(JSON.parse(saved));
                }
            }
        } catch (error) {
            console.error('❌ EDITOR.JS: Error loading design:', error);
            console.error('❌ EDITOR.JS: Error details:', error.message);
            // Fallback to localStorage
            const saved = localStorage.getItem(`polotno-design-${designId}`);
            if (saved) {
                console.log('📦 EDITOR.JS: Using localStorage fallback after error');
                setDesignData(JSON.parse(saved));
            } else {
                console.log('❌ EDITOR.JS: No localStorage fallback available');
            }
        }

        console.log('🔍 EDITOR.JS: loadDesignData finished');
    };

    return (
        <div className="h-screen w-full">
            <AdminPolotnoEditor
                userSession={{ user }}
                designId={id}
                initialData={designData}
                image={router.query.image}
            />
        </div>
    );
}

// Disable default layout for full-screen editor
AdminEditorPage.getLayout = function getLayout(page) {
    return page;
};

export default withAdminAuth(AdminEditorPage);