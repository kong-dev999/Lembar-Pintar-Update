import { useState, useEffect } from "react";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { getTrashItemThumbnail, getNextFallbackThumbnail, logThumbnailResolution, normalizeTrashItem, getPlaceholderForType } from '@/lib/helpers/trash-thumbnail-helpers';

function TrashPage({ user }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [summary, setSummary] = useState({
        totalElements: 0,
        totalTemplates: 0,
        totalItems: 0
    });
    const [processingItems, setProcessingItems] = useState(new Set());

    useEffect(() => {
        fetchTrashData();
    }, [currentTab, searchTerm, pagination.page]);

    const fetchTrashData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: currentTab,
                search: searchTerm,
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            const response = await fetch(`/api/admin/trash?${params}`);
            const data = await response.json();

            if (data.success) {
                setItems(data.data.items);
                setPagination(data.data.pagination);
                setSummary(data.data.summary);
            }
        } catch (error) {
            console.error('Error fetching trash data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (itemId, itemType) => {
        if (processingItems.has(itemId)) return;

        setProcessingItems(prev => new Set(prev).add(itemId));

        try {
            const response = await fetch(`/api/admin/trash/${itemId}/restore`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemType })
            });

            const data = await response.json();

            if (data.success) {
                // Remove item from list
                setItems(prev => prev.filter(item => item.id !== itemId));
                // Update summary
                setSummary(prev => ({
                    ...prev,
                    totalItems: prev.totalItems - 1,
                    totalElements: itemType === 'element' ? prev.totalElements - 1 : prev.totalElements,
                    totalTemplates: itemType === 'template' ? prev.totalTemplates - 1 : prev.totalTemplates
                }));
                // Show success message (you can add toast here)
                console.log('Item restored successfully');
            } else {
                console.error('Failed to restore item:', data.message);
            }
        } catch (error) {
            console.error('Error restoring item:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handlePermanentDelete = async (itemId, itemType) => {
        if (processingItems.has(itemId)) return;

        const confirmed = window.confirm(
            `Apakah Anda yakin ingin menghapus ${itemType === 'element' ? 'element' : 'template'} ini secara permanen? Tindakan ini tidak dapat dibatalkan.`
        );

        if (!confirmed) return;

        setProcessingItems(prev => new Set(prev).add(itemId));

        try {
            const response = await fetch(`/api/admin/trash/${itemId}/permanent`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemType })
            });

            const data = await response.json();

            if (data.success) {
                // Remove item from list
                setItems(prev => prev.filter(item => item.id !== itemId));
                // Update summary
                setSummary(prev => ({
                    ...prev,
                    totalItems: prev.totalItems - 1,
                    totalElements: itemType === 'element' ? prev.totalElements - 1 : prev.totalElements,
                    totalTemplates: itemType === 'template' ? prev.totalTemplates - 1 : prev.totalTemplates
                }));
                console.log('Item deleted permanently');
            } else {
                console.error('Failed to delete item:', data.message);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setProcessingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: localeId });
        } catch {
            return 'Invalid date';
        }
    };

    const getItemTypeDisplay = (item) => {
        if (item.itemType === 'template') return 'Template';
        if (item.itemType === 'element') return 'Element';
        return item.type || 'Asset';
    };


    if (loading && items.length === 0) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="space-y-8">
                        {/* Loading Header */}
                        <div className="bg-white shadow-sm border-b">
                            <div className="px-4 sm:px-6 py-6 sm:py-8">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 sm:px-6">
                            {/* Loading Tabs */}
                            <div className="flex space-x-1 mb-6 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-10 bg-gray-200 rounded w-20"></div>
                                ))}
                            </div>

                            {/* Loading Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4 animate-pulse">
                                        <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="flex space-x-2">
                                            <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                            <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 overflow-y-auto">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="px-4 sm:px-6 py-6 sm:py-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sampah</h1>
                                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                                        Kelola elemen dan template yang dihapus
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                    <div className="text-xs sm:text-sm text-gray-500">
                                        Total: {summary.totalItems} item
                                    </div>
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <TabButton
                                active={currentTab === 'all'}
                                onClick={() => handleTabChange('all')}
                                count={summary.totalItems}
                            >
                                Semua Item
                            </TabButton>
                            <TabButton
                                active={currentTab === 'element'}
                                onClick={() => handleTabChange('element')}
                                count={summary.totalElements}
                                color="blue"
                            >
                                Elemen
                            </TabButton>
                            <TabButton
                                active={currentTab === 'template'}
                                onClick={() => handleTabChange('template')}
                                count={summary.totalTemplates}
                                color="purple"
                            >
                                Template
                            </TabButton>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari item yang dihapus..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Items Grid */}
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <TrashIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada item yang dihapus</h3>
                                <p className="text-gray-600">
                                    {searchTerm ? 'Tidak ada item yang sesuai dengan pencarian Anda.' : 'Sampah kosong.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                                    {items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                                <ThumbnailImage item={item} />
                                                <div className="absolute top-2 right-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.itemType === 'template'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {getItemTypeDisplay(item)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2 truncate">
                                                    {item.description || 'Tidak ada deskripsi'}
                                                </p>
                                                <div className="text-xs text-gray-500 mb-4">
                                                    <div>Dihapus: {formatDate(item.deletedAt)}</div>
                                                    {item.deletedBy && (
                                                        <div>Oleh: {item.deletedBy.name || item.deletedBy.email}</div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleRestore(item.id, item.itemType)}
                                                        disabled={processingItems.has(item.id)}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                                    >
                                                        {processingItems.has(item.id) ? (
                                                            <LoadingSpinner />
                                                        ) : (
                                                            <>
                                                                <RestoreIcon className="w-4 h-4 mr-1" />
                                                                Pulihkan
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item.id, item.itemType)}
                                                        disabled={processingItems.has(item.id)}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                                    >
                                                        {processingItems.has(item.id) ? (
                                                            <LoadingSpinner />
                                                        ) : (
                                                            <>
                                                                <DeleteIcon className="w-4 h-4 mr-1" />
                                                                Hapus
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} sampai{' '}
                                            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                                            {pagination.total} hasil
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                disabled={pagination.page === 1}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Sebelumnya
                                            </button>
                                            <span className="px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                                                Halaman {pagination.page} dari {pagination.pages}
                                            </span>
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                disabled={pagination.page === pagination.pages}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Selanjutnya
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Helper Components
const ThumbnailImage = ({ item }) => {
    const [hasError, setHasError] = useState(false);

    // Get initial thumbnail URL
    const getInitialThumbnail = (item) => {
        return item.previewUrl || item.thumbnailUrl || item.url || getPlaceholderForType(item.itemType || item.type);
    };

    const [thumbnailUrl, setThumbnailUrl] = useState(getInitialThumbnail(item));

    const handleImageError = (e) => {
        const currentSrc = e.target.src;
        const nextFallback = getNextFallbackThumbnail(item, currentSrc);

        if (nextFallback) {
            e.target.src = nextFallback;

            if (process.env.NODE_ENV === 'development') {
                console.warn(`🖼️ Thumbnail fallback for ${item.id}: ${currentSrc} -> ${nextFallback}`);
            }
        } else {
            setHasError(true);
            if (process.env.NODE_ENV === 'development') {
                console.error(`🖼️ All thumbnails failed for ${item.id}: ${currentSrc}`);
            }
        }
    };

    // Get thumbnail URL langsung dari item data (sudah dari API)
    useEffect(() => {
        const thumbnailFromAPI = getTrashItemThumbnail(item);
        setThumbnailUrl(thumbnailFromAPI);

        if (process.env.NODE_ENV === 'development') {
            logThumbnailResolution(item, thumbnailFromAPI);
        }
    }, [item.id]);

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <div className="text-center">
                    <div className="text-2xl mb-1">🖼️</div>
                    <div className="text-xs">No Image</div>
                </div>
            </div>
        );
    }

    return (
        <img
            src={thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
        />
    );
};

const TabButton = ({ children, active, onClick, count, color = 'gray' }) => {
    const colorClasses = {
        gray: active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        purple: active ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${colorClasses[color]}`}
        >
            <span>{children}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-50'
                }`}>
                {count}
            </span>
        </button>
    );
};

const LoadingSpinner = () => (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// SVG Icons
const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const RestoreIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
);

const DeleteIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default withAdminAuth(TrashPage);