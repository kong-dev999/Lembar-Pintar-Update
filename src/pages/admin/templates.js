import { useState, useEffect } from "react";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { useRouter } from 'next/router';
import AdminLayout from "@/components/admin/AdminLayout";

// Helper: get template thumbnail - akses properti dengan aman
const getTemplateThumbnail = (template) => {
    if (!template) return null;

    // Pastikan template adalah objek yang valid
    if (typeof template !== 'object') {
        console.warn('Invalid template object:', template);
        return null;
    }

    // Priority order for thumbnail sources:
    // 1. thumbnailUrl from template data (stored in database)
    // 2. previewUrl from template data
    // 3. Direct path to thumbnail file in legacy location

    // Cek thumbnailUrl dari template langsung dengan aman
    if (template.thumbnailUrl && typeof template.thumbnailUrl === 'string') {
        return template.thumbnailUrl;
    }

    // Cek previewUrl dari template langsung dengan aman
    if (template.previewUrl && typeof template.previewUrl === 'string') {
        return template.previewUrl;
    }

    // Cek melalui relasi template -> previews -> file dengan aman
    try {
        if (template.template && typeof template.template === 'object') {
            // Jika template memiliki previews array
            if (Array.isArray(template.template.previews) && template.template.previews.length > 0) {
                // Cari preview dengan size 'thumbnail' atau gunakan yang pertama
                const thumbnailPreview = template.template.previews.find(p => p && p.size === 'thumbnail') || template.template.previews[0];

                if (thumbnailPreview && typeof thumbnailPreview === 'object') {
                    // Cek file preview
                    if (thumbnailPreview.file && typeof thumbnailPreview.file === 'object' && thumbnailPreview.file.url) {
                        return thumbnailPreview.file.url;
                    }

                    // Cek url langsung di preview
                    if (thumbnailPreview.url && typeof thumbnailPreview.url === 'string') {
                        return thumbnailPreview.url;
                    }
                }
            }

            // Fallback ke previewUrl dari template.template
            if (template.template.previewUrl && typeof template.template.previewUrl === 'string') {
                return template.template.previewUrl;
            }

            // Fallback ke thumbnailUrl dari template.template
            if (template.template.thumbnailUrl && typeof template.template.thumbnailUrl === 'string') {
                return template.template.thumbnailUrl;
            }
        }
    } catch (e) {
        console.warn('Safe access to template.template previews failed:', e.message);
    }

    // Use direct path to thumbnail file dengan aman - extract template ID from asset ID
    try {
        const templateId = template.id || (template.template && template.template.id);
        if (templateId && typeof templateId === 'string') {
            const cleanId = templateId.startsWith('template-') ? templateId.replace('template-', '') : templateId;
            return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/content/assets/global/templates/thumbnail/template-${cleanId}-thumb.jpg`;
        }
    } catch (e) {
        console.warn('Safe construction of thumbnail path failed:', e.message);
    }

    return null;
};

// Helper: get premium level dengan pengecekan aman
const getPremiumLevel = (template) => {
    if (!template) return 'FREE';

    // Cek langsung di template dengan aman
    if (template.premiumLevel && typeof template.premiumLevel === 'string') {
        return template.premiumLevel;
    }

    // Cek di template.template dengan aman
    try {
        if (template.template && typeof template.template === 'object' && template.template.premiumLevel && typeof template.template.premiumLevel === 'string') {
            return template.template.premiumLevel;
        }
    } catch (e) {
        console.warn('Safe access to template.template.premiumLevel failed:', e.message);
    }

    return 'FREE';
};

function TemplateTable({ user }) {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [filter, setFilter] = useState("");
    const [templateList, setTemplateList] = useState([]);
    const [recentTemplates, setRecentTemplates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 24;
    const [gridCols, setGridCols] = useState(3);

    // Calculate grid columns based on screen width
    const calculateGridCols = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width >= 1536) return 8; // 2xl
            if (width >= 1280) return 7; // xl
            if (width >= 1024) return 6; // lg
            if (width >= 768) return 5;  // md
            if (width >= 640) return 4;  // sm
            return 3; // mobile
        }
        return 3;
    };

    useEffect(() => {
        fetchTemplates(1);
        fetchRecentTemplates(); // Fetch recent templates separately

        setGridCols(calculateGridCols());

        const handleResize = () => {
            setGridCols(calculateGridCols());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const authenticatedFetch = async (url, options = {}) => {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };
        if (options.body instanceof FormData) {
            delete defaultOptions.headers['Content-Type'];
        }
        return fetch(url, defaultOptions);
    };

    // Fetch recent templates (only once, separate from main list)
    const fetchRecentTemplates = async () => {
        try {
            console.log('🔍 Fetching recent templates...');
            const res = await authenticatedFetch(`/api/templates/educational?page=1&limit=8`);
            const data = await res.json();

            if (data.success && data.data && Array.isArray(data.data)) {
                setRecentTemplates(data.data);
                console.log(`✅ Loaded ${data.data.length} recent templates`);
            } else {
                setRecentTemplates([]);
            }
        } catch (error) {
            console.error("Fetch recent templates error:", error);
            setRecentTemplates([]);
        }
    };

    // Fetch templates from educational API - dengan caching untuk menghindari flicker
    const fetchTemplates = async (page = 1, search = '') => {
        try {
            console.log('🔍 Fetching templates from educational API...');
            let url = `/api/templates/educational?page=${page}&limit=${ITEMS_PER_PAGE}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await authenticatedFetch(url);
            const data = await res.json();

            if (!res.ok) {
                console.error("Failed to fetch templates:", data.error);
                setTemplateList([]);
                setTotalItems(0);
                setTotalPages(1);
                setCurrentPage(1);
                return;
            }

            if (data.success && data.data && Array.isArray(data.data)) {
                // Tambahkan cache key untuk mencegah flicker
                const templatesWithCache = data.data.map(template => ({
                    ...template,
                    _cacheKey: `${template.id}-${template.updatedAt || template.createdAt}`
                }));

                setTemplateList(templatesWithCache);
                setTotalItems(data.pagination?.total || 0);
                setTotalPages(data.pagination?.pages || 1);
                setCurrentPage(data.pagination?.page || 1);

                console.log(`✅ Loaded ${data.data.length} templates (page ${page})`);
            } else {
                setTemplateList([]);
                setTotalItems(0);
                setTotalPages(1);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Fetch templates error:", error);
            setTemplateList([]);
        }
    };

    // Fetch template detail - menggunakan API detail dengan JOIN lengkap Asset + Template + semua relasi
    const fetchTemplateDetail = async (templateId) => {
        try {
            console.log('🔍 Fetching COMPLETE template detail with JOINs for ID:', templateId);

            // Gunakan API detail yang sudah JOIN Asset + Template + educationLevels + grades + subjects + categories + tags + previews
            const res = await authenticatedFetch(`/api/templates/${templateId}/detail`);
            const data = await res.json();

            if (!res.ok) {
                console.error("Template detail fetch failed:", data.message);
                return null;
            }

            console.log('✅ COMPLETE template detail fetched with ALL JOINS:', data.data);
            console.log('📊 Template relations loaded:', {
                title: data.data?.title,
                categories: data.data?.template?.categories?.length || 0,
                tags: data.data?.template?.tags?.length || 0,
                educationLevels: data.data?.template?.educationLevels?.length || 0,
                grades: data.data?.template?.grades?.length || 0,
                subjects: data.data?.template?.subjects?.length || 0,
                hasEducationalContext: !!data.data?.educationalContext
            });

            return data.data || null;
        } catch (error) {
            console.error("Error fetching complete template detail:", error);
            return null;
        }
    };

    // Delete template
    const deleteTemplate = async (templateId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) {
            return;
        }

        try {
            const res = await authenticatedFetch(`/api/templates/${templateId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                alert("Template berhasil dihapus!");
                setSelectedTemplate(null);
                fetchTemplates(currentPage);
            } else {
                alert(`Gagal menghapus template: ${data.message || "Terjadi kesalahan"}`);
            }
        } catch (error) {
            console.error("Error deleting template:", error);
            alert("Terjadi kesalahan saat menghapus template");
        }
    };

    // Get recent templates (from separate state)
    const getRecentTemplates = () => {
        return recentTemplates;
    };

    return (
        <AdminLayout>
            <div className="bg-white shadow rounded-lg p-6 min-h-screen overflow-y-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl lg:text-2xl font-bold">Manajemen Template</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            Welcome, {user?.name || user?.email}
                        </div>
                        <div className="flex gap-2">
                            <input
                                placeholder="Cari template..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border px-2 py-1 rounded flex-1 sm:w-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Separator after header */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Recent Templates Section - menggunakan data dari templateList */}
                {getRecentTemplates().length > 0 && (
                    <div className="mb-10">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Template Terbaru</h2>
                                        <p className="text-sm text-green-700 mt-0.5">Template yang baru saja ditambahkan ke sistem</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full shadow-sm">
                                        {Math.min(getRecentTemplates().length, gridCols * 2)} Template Terbaru
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent templates grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                            {recentTemplates.slice(0, gridCols * 2).map((template) => (
                                <div
                                    key={template.id}
                                    onClick={async () => {
                                        // Selalu ambil detail lengkap dengan JOIN dari API untuk memastikan semua relasi ter-load
                                        const templateDetail = await fetchTemplateDetail(template.id);
                                        setSelectedTemplate(templateDetail || template);
                                    }}
                                    className="group relative bg-gradient-to-b from-white to-green-50/30 rounded-lg border border-green-200/60 shadow-sm hover:shadow-lg hover:border-green-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-green-50/50 flex items-center justify-center p-2 overflow-hidden relative">
                                        {getTemplateThumbnail(template) ? (
                                            <img
                                                src={getTemplateThumbnail(template)}
                                                alt={template.title}
                                                className="w-full h-full object-contain max-h-16 group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-[10px]">No preview</span></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-400 text-[10px]">No preview</span>
                                            </div>
                                        )}

                                        {/* Premium Badge */}
                                        <div className="absolute top-1 right-1">
                                            {template.template?.premiumLevel === 'FREE' ? (
                                                <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm" title="FREE">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : template.template?.premiumLevel === 'PRO' ? (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm" title="PRO">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : template.template?.premiumLevel === 'PREMIUM' ? (
                                                <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" title="PREMIUM">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-3 h-3 bg-gray-400 rounded-full border border-white shadow-sm" title="FREE">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Badge */}
                                        <div className="absolute top-1 left-1">
                                            <span className="px-1 py-0.5 text-[7px] font-bold bg-white/95 text-green-700 rounded border border-green-200 shadow-sm">
                                                TEMPLATE
                                            </span>
                                        </div>

                                        {/* NEW Badge - tampilkan berdasarkan waktu pembuatan template (7 hari terakhir) */}
                                        {(() => {
                                            try {
                                                if (template.createdAt) {
                                                    const createdAt = new Date(template.createdAt);
                                                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                                    if (createdAt > sevenDaysAgo) {
                                                        return (
                                                            <div className="absolute -top-1 -right-1">
                                                                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                                                    <span className="text-white text-[8px] font-bold">NEW</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                }
                                            } catch (e) {
                                                console.warn('Error checking template creation date:', e.message);
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    {/* Content */}
                                    <div className="p-2 bg-white/80">
                                        <h3 className="text-[11px] font-semibold text-gray-900 mb-1 line-clamp-1 leading-tight">
                                            {template.title}
                                        </h3>
                                        <div className="text-[9px] text-gray-500 flex items-center gap-1">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(template.createdAt).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="mt-10 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <div className="px-4 bg-white">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                            <span className="text-sm font-medium">Semua Template</span>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Grid Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Semua Template</h2>
                            <p className="text-sm text-gray-500">Total {totalItems} template tersedia</p>
                        </div>
                    </div>
                </div>

                {/* Main Templates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {templateList
                        .filter((t) => filter === "" || t.title.toLowerCase().includes(filter.toLowerCase()))
                        .map((template) => (
                            <div
                                key={template.id}
                                onClick={async () => {
                                    // Selalu ambil detail lengkap dengan JOIN dari API untuk memastikan semua relasi ter-load
                                    const templateDetail = await fetchTemplateDetail(template.id);
                                    setSelectedTemplate(templateDetail || template);
                                }}
                                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="absolute inset-0">
                                    {getTemplateThumbnail(template) ? (
                                        <img
                                            src={getTemplateThumbnail(template)}
                                            alt={template.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-xs">No preview</span></div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No preview</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-[11px] leading-tight line-clamp-2">{template.title}</p>
                                    {/* Premium Level Badge */}
                                    <div className="flex items-center gap-1 mt-1">
                                        {template.template?.premiumLevel === 'FREE' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-green-100 text-green-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                FREE
                                            </span>
                                        ) : template.template?.premiumLevel === 'PRO' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-blue-100 text-blue-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                                PRO
                                            </span>
                                        ) : template.template?.premiumLevel === 'PREMIUM' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-purple-100 text-purple-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                PREMIUM
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-gray-100 text-gray-800 rounded">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-white/80 text-gray-700 rounded">
                                    TEMPLATE
                                </span>
                            </div>
                        ))}
                    {templateList.filter(t => filter === "" || t.title.toLowerCase().includes(filter.toLowerCase())).length === 0 && (
                        <div className="col-span-full text-center p-4 text-gray-500 text-sm">
                            Tidak ada template ditemukan.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems} items
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (currentPage > 1) {
                                        fetchTemplates(currentPage - 1);
                                    }
                                }}
                                disabled={currentPage <= 1}
                                className={`px-3 py-2 rounded text-sm ${currentPage <= 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">‹</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 7) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 4) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        pageNum = totalPages - 6 + i;
                                    } else {
                                        pageNum = currentPage - 3 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchTemplates(pageNum)}
                                            className={`w-8 h-8 rounded text-sm ${currentPage === pageNum
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    if (currentPage < totalPages) {
                                        fetchTemplates(currentPage + 1);
                                    }
                                }}
                                disabled={currentPage >= totalPages}
                                className={`px-3 py-2 rounded text-sm ${currentPage >= totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">›</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Template Detail Modal */}
                {selectedTemplate && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedTemplate(null)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-0 border border-gray-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex">
                                {/* Preview Image */}
                                <div className="w-1/2 bg-gray-50 flex items-center justify-center p-8 rounded-l-lg">
                                    {getTemplateThumbnail(selectedTemplate) ? (
                                        <img
                                            src={getTemplateThumbnail(selectedTemplate)}
                                            alt={selectedTemplate.title}
                                            className="max-w-full max-h-80 object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div class="text-gray-400">No preview available</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-gray-400">No preview available</div>
                                    )}
                                </div>

                                {/* Template Details */}
                                <div className="w-1/2 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                                        <button
                                            onClick={() => setSelectedTemplate(null)}
                                            className="text-gray-400 hover:text-gray-600 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                                        {/* Basic Info */}
                                        <div>
                                            <span className="text-gray-600 font-semibold">Tipe:</span>
                                            <div className="text-green-600 font-medium">{selectedTemplate.type || 'TEMPLATE'}</div>
                                        </div>

                                        {/* Premium Level */}
                                        <div>
                                            <span className="text-gray-600 font-semibold">Premium Level:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {selectedTemplate.template?.premiumLevel === 'FREE' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        FREE - Tersedia untuk semua user
                                                    </span>
                                                ) : selectedTemplate.template?.premiumLevel === 'PRO' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                        </svg>
                                                        PRO - Tersedia untuk user Pro & Premium
                                                    </span>
                                                ) : selectedTemplate.template?.premiumLevel === 'PREMIUM' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        PREMIUM - Hanya untuk user Premium
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                        FREE - Tersedia untuk semua user
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dimensions */}
                                        {selectedTemplate.dimensions && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Dimensi:</span>
                                                <div className="text-green-600 font-medium">{selectedTemplate.dimensions} {selectedTemplate.template?.unit || 'PX'}</div>
                                            </div>
                                        )}

                                        {/* File Size */}
                                        {selectedTemplate.fileSize && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Ukuran File:</span>
                                                <div className="text-green-600 font-medium">{selectedTemplate.fileSize}</div>
                                            </div>
                                        )}

                                        {/* MIME Type */}
                                        {selectedTemplate.mime && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Format:</span>
                                                <div className="text-green-600 font-medium">{selectedTemplate.mime}</div>
                                            </div>
                                        )}

                                        {/* Educational Context - Detailed Display */}
                                        {selectedTemplate.template?.educationLevels && selectedTemplate.template.educationLevels.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Jenjang Pendidikan:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.template.educationLevels.map((level, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                            {level.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedTemplate.template?.grades && selectedTemplate.template.grades.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Kelas:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.template.grades.map((grade, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                            {grade.displayName || grade.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedTemplate.template?.subjects && selectedTemplate.template.subjects.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Mata Pelajaran:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.template.subjects.map((subject, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                            {subject.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedTemplate.template?.categories && selectedTemplate.template.categories.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Kategori Template:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.template.categories.map((category, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                                                            {category.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Template Tags */}
                                        {selectedTemplate.template?.tags && selectedTemplate.template.tags.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Template Tags:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.template.tags.map((tag, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Element Tags (jika ada) */}
                                        {selectedTemplate.element?.tags && selectedTemplate.element.tags.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Element Tags:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.element.tags.map((tag, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Element Categories (jika ada) */}
                                        {selectedTemplate.element?.categories && selectedTemplate.element.categories.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Element Kategori:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.element.categories.map((category, index) => (
                                                        <span key={index} className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                                            {category.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Element Format (jika ada) */}
                                        {selectedTemplate.element?.format && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Element Format:</span>
                                                <div className="text-teal-600 font-medium">
                                                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
                                                        {selectedTemplate.element.format}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Educational Context Summary (fallback) */}
                                        {selectedTemplate.educationalContext && !selectedTemplate.template?.educationLevels && (
                                            <>
                                                {selectedTemplate.educationalContext.levels !== 'Tidak ada' && (
                                                    <div>
                                                        <span className="text-gray-600 font-semibold">Jenjang (Summary):</span>
                                                        <div className="text-blue-600 font-medium">{selectedTemplate.educationalContext.levels}</div>
                                                    </div>
                                                )}

                                                {selectedTemplate.educationalContext.grades !== 'Tidak ada' && (
                                                    <div>
                                                        <span className="text-gray-600 font-semibold">Kelas (Summary):</span>
                                                        <div className="text-blue-600 font-medium">{selectedTemplate.educationalContext.grades}</div>
                                                    </div>
                                                )}

                                                {selectedTemplate.educationalContext.subjects !== 'Tidak ada' && (
                                                    <div>
                                                        <span className="text-gray-600 font-semibold">Mata Pelajaran (Summary):</span>
                                                        <div className="text-blue-600 font-medium">{selectedTemplate.educationalContext.subjects}</div>
                                                    </div>
                                                )}

                                                {selectedTemplate.educationalContext.categories !== 'Tidak ada' && (
                                                    <div>
                                                        <span className="text-gray-600 font-semibold">Kategori (Summary):</span>
                                                        <div className="text-purple-600 font-medium">{selectedTemplate.educationalContext.categories}</div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Upload Info */}
                                        {selectedTemplate.uploadedBy && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Diupload oleh:</span>
                                                <div className="text-indigo-600 font-medium">
                                                    {selectedTemplate.uploadedBy.name} ({selectedTemplate.uploadedBy.email})
                                                    {selectedTemplate.uploadedBy.role && (
                                                        <span className="ml-2 px-1 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                                                            {selectedTemplate.uploadedBy.role}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Created Date */}
                                        {selectedTemplate.createdAt && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Tanggal Dibuat:</span>
                                                <div className="text-gray-800 font-medium">
                                                    {new Date(selectedTemplate.createdAt).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Asset Status & Visibility */}
                                        {selectedTemplate.status && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Status Asset:</span>
                                                <div className="text-green-600 font-medium">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded ${selectedTemplate.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                                        selectedTemplate.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {selectedTemplate.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {selectedTemplate.visibility && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Visibilitas:</span>
                                                <div className="text-blue-600 font-medium">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded ${selectedTemplate.visibility === 'PUBLIC' ? 'bg-blue-100 text-blue-800' :
                                                        selectedTemplate.visibility === 'PRIVATE' ? 'bg-red-100 text-red-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        {selectedTemplate.visibility}
                                                    </span>
                                                </div>
                                            </div>
                                        )}


                                        {/* System Asset Flag */}
                                        {typeof selectedTemplate.isSystemAsset !== 'undefined' && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Sistem Asset:</span>
                                                <div className="text-indigo-600 font-medium">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded ${selectedTemplate.isSystemAsset ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {selectedTemplate.isSystemAsset ? 'Ya' : 'Tidak'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Color & Font Palettes */}
                                        {selectedTemplate.template?.colorPalette && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Palet Warna:</span>
                                                <div className="text-pink-600 font-medium">✓ Tersedia</div>
                                            </div>
                                        )}

                                        {selectedTemplate.template?.fontPalette && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Palet Font:</span>
                                                <div className="text-pink-600 font-medium">✓ Tersedia</div>
                                            </div>
                                        )}

                                        {/* Preview Files Count */}
                                        {selectedTemplate.template?.previews && selectedTemplate.template.previews.length > 0 && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">File Preview:</span>
                                                <div className="text-green-600 font-medium">{selectedTemplate.template.previews.length} file(s)</div>
                                            </div>
                                        )}

                                        {/* Aspect Ratio */}
                                        {selectedTemplate.aspectRatio && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Rasio Aspek:</span>
                                                <div className="text-green-600 font-medium">{selectedTemplate.aspectRatio}:1</div>
                                            </div>
                                        )}

                                        {/* Updated Date */}
                                        {selectedTemplate.updatedAt && selectedTemplate.updatedAt !== selectedTemplate.createdAt && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Terakhir Diperbarui:</span>
                                                <div className="text-gray-800 font-medium">
                                                    {new Date(selectedTemplate.updatedAt).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div>
                                            <span className="text-gray-600 font-semibold">Deskripsi:</span>
                                            <div className="text-green-600 font-medium">{selectedTemplate.description || "Tidak ada deskripsi"}</div>
                                        </div>

                                        {/* Stats */}
                                        {selectedTemplate.stats && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">Status:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedTemplate.stats.hasPreview && (
                                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                            ✓ Ada Preview
                                                        </span>
                                                    )}
                                                    {selectedTemplate.stats.isEducational && (
                                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                            🎓 Educational
                                                        </span>
                                                    )}
                                                    {selectedTemplate.stats.hasCategories && (
                                                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                            📁 Terkategori
                                                        </span>
                                                    )}
                                                    {selectedTemplate.stats.hasTags && (
                                                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                                            🏷️ Ada Tags
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => deleteTemplate(selectedTemplate.id)}
                                            className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Hapus
                                        </button>
                                        <button
                                            onClick={() => setSelectedTemplate(null)}
                                            className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function AdminTemplatesPage({ user }) {
    return <TemplateTable user={user} />;
}

export default withAdminAuth(AdminTemplatesPage);