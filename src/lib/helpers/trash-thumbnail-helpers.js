/**
 * Helper functions untuk menangani thumbnail di halaman trash admin
 * Menggunakan CDN URL saja untuk performa optimal
 */

// Helper untuk get CDN URL (CloudFront or S3 fallback) - sama seperti di asset-helpers.js
function getCdnUrl() {
    return process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL;
}

/**
 * Get real file URL langsung dari Element table
 * Mengambil URL dari tabel Element yang punya relasi ke File
 * @param {string} elementId - Element ID langsung
 * @returns {Promise<string|null>} - Real file URL atau null
 */
export async function getRealElementFileUrl(elementId) {
    if (!elementId) {
        return null;
    }

    try {
        // Import prisma di sini untuk menghindari circular dependency
        const { default: prisma } = await import('@/prisma/index');

        // Langsung ambil dari Element table dengan include File relations
        const element = await prisma.element.findUnique({
            where: { id: elementId },
            include: {
                sourceFile: true,
                previewFile: true
            }
        });

        if (element) {
            // Prioritas: previewFile -> sourceFile
            return element.previewFile?.url || element.sourceFile?.url || null;
        }

        return null;

    } catch (error) {
        console.warn('Failed to get real element file URL:', error);
        return null;
    }
}

/**
 * Get real file URL untuk Template langsung dari TemplatePreview table
 * @param {string} templateId - Template ID langsung
 * @returns {Promise<string|null>} - Real file URL atau null
 */
export async function getRealTemplateFileUrl(templateId) {
    if (!templateId) {
        return null;
    }

    try {
        const { default: prisma } = await import('@/prisma/index');

        // Ambil dari TemplatePreview dengan File relation
        const templatePreview = await prisma.templatePreview.findFirst({
            where: { templateId: templateId },
            include: { file: true },
            orderBy: { size: 'desc' } // Ambil yang terbesar
        });

        if (templatePreview?.file) {
            return templatePreview.file.url;
        }

        return null;

    } catch (error) {
        console.warn('Failed to get real template file URL:', error);
        return null;
    }
}

/**
 * Get appropriate thumbnail URL untuk trash items
 * API sudah harus memberikan URL dari Element/Template table
 * @param {Object} item - Item data dari trash API
 * @returns {string} - Thumbnail URL dari API atau fallback
 */
export function getTrashItemThumbnail(item) {
    // API seharusnya sudah memberikan URL dari Element/Template → File relation

    // 1. Prioritas: URL dari API yang sudah di-JOIN
    if (item.previewUrl) {
        return item.previewUrl;
    }

    if (item.thumbnailUrl) {
        return item.thumbnailUrl;
    }

    if (item.url) {
        return item.url;
    }

    // 2. Final fallback ke placeholder jika API tidak berikan URL
    console.warn(`No URL found for ${item.itemType} ${item.id}, using placeholder`);
    return getPlaceholderForType(item.itemType || item.type);
}

/**
 * Get placeholder image berdasarkan type
 * @param {string} type - Type asset (template/element)
 * @returns {string} - Placeholder image path
 */
export function getPlaceholderForType(type) {
    // Gunakan placeholder dari public folder atau fallback ke data URL
    if (type === 'template' || type === 'TEMPLATE') {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIzMCIgZmlsbD0iI0U1RTdFQiIvPgo8cmVjdCB4PSIyMCIgeT0iNzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRDFENU9CIi8+CjxyZWN0IHg9IjE2MCIgeT0iNzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyBpZD0iaWNvbiIgeD0iMTI1IiB5PSI4NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOTdBM0FGIj4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KPHA+VGVtcGxhdGU8L3A+Cjwvc3ZnPgo8L3N2Zz4=';
    }

    if (type === 'element' || type === 'ELEMENT') {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiM5N0EzQUYiLz4KPHN2ZyB4PSI4NSIgeT0iODUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0id2hpdGUiPgo8cD5FPC9wPgo8L3N2Zz4KPC9zdmc+';
    }

    // Generic fallback - simple gray rectangle with icon
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjYwIiB5PSI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTdBM0FGIi8+CjwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzY5NzU4MyIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFzc2V0PC90ZXh0Pgo8L3N2Zz4=';
}

/**
 * Get fallback URLs untuk multi-level error handling
 * Menggunakan CDN URL saja
 * @param {Object} item - Item data
 * @param {string} currentSrc - Current failing source
 * @returns {string|null} - Next fallback URL atau null jika sudah final
 */
export function getNextFallbackThumbnail(item, currentSrc) {
    const itemType = item.itemType || item.type?.toLowerCase();
    const cdnUrl = getCdnUrl();

    // Untuk template - hierarki fallback dengan CDN saja
    if (itemType === 'template') {
        const templateId = item.assetableId || item.id;

        // Jika admin thumbnail gagal, coba preview API
        if (currentSrc.includes('/templates/thumbnail/')) {
            return `/api/templates/${templateId}/preview`;
        }

        // Jika preview API gagal, coba thumbnail dengan CDN
        if (currentSrc.includes('/api/templates/')) {
            return `${cdnUrl}/content/assets/global/templates/thumbnail/template-${templateId}-thumb.jpg`;
        }

        // Jika medium preview gagal, coba small preview WebP dengan CDN
        if (currentSrc.includes('medium.webp')) {
            return `${cdnUrl}/content/assets/global/templates/preview/template-${templateId}-small.webp`;
        }

        // Final fallback ke placeholder
        if (!currentSrc.includes('placeholder')) {
            return getPlaceholderForType('template');
        }
    }

    // Untuk element - fallback dengan CDN saja
    if (itemType === 'element') {
        const elementId = item.assetableId || item.id;

        // Jika path dengan assetableId gagal, coba dengan asset ID
        if (currentSrc.includes('/elements/file/') && item.assetableId && currentSrc.includes(item.assetableId)) {
            return `${cdnUrl}/content/assets/global/elements/file/${item.id}.svg`;
        }

        // Jika SVG gagal, coba PNG
        if (currentSrc.includes('.svg')) {
            return currentSrc.replace('.svg', '.png');
        }

        // Jika PNG gagal, coba JPG
        if (currentSrc.includes('.png')) {
            return currentSrc.replace('.png', '.jpg');
        }

        // Final fallback ke placeholder
        if (!currentSrc.includes('placeholder')) {
            return getPlaceholderForType('element');
        }
    }

    // Sudah mencapai placeholder, tidak ada fallback lagi
    return null;
}

/**
 * Get real thumbnail URL dengan akurasi tinggi
 * API sudah memberikan URL yang akurat dari JOIN, jadi tidak perlu query lagi
 * @param {Object} item - Item data dari trash API
 * @returns {string} - Thumbnail URL yang sudah akurat dari API
 */
export function getAccurateThumbnailUrl(item) {
    // API /admin/trash sudah melakukan JOIN yang akurat
    // Tidak perlu database query tambahan di client
    return getTrashItemThumbnail(item);
}

/**
 * Debug function untuk logging thumbnail resolution
 * @param {Object} item - Item data
 * @param {string} resolvedUrl - URL yang berhasil di-resolve
 */
export function logThumbnailResolution(item, resolvedUrl) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`🖼️ Thumbnail resolved for ${item.itemType} ${item.id}:`, {
            title: item.title,
            type: item.itemType,
            assetableId: item.assetableId,
            assetableType: item.assetableType,
            resolvedUrl,
            hasOriginalThumbnail: !!item.thumbnailUrl
        });
    }
}

/**
 * Validate dan normalize item data untuk thumbnail resolution
 * @param {Object} item - Raw item data
 * @returns {Object} - Normalized item data
 */
export function normalizeTrashItem(item) {
    return {
        id: item.id,
        assetableId: item.assetableId,
        assetableType: item.assetableType,
        itemType: item.itemType || item.type?.toLowerCase(),
        type: item.type,
        title: item.title,
        thumbnailUrl: item.thumbnailUrl
    };
}