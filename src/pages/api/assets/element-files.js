// /api/assets/element-files.js - Query untuk grid display (tidak perlu detail lengkap)
import prisma from "@/prisma/index";

// Helper untuk parsing integer dengan default
const parseIntWithDefault = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        const {
            search,
            category,
            categoryId,
            page = 1,
            limit = 20
        } = req.query;

        const pageNumber = parseIntWithDefault(page, 1);
        const limitNumber = parseIntWithDefault(limit, 20);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;

        // Query Asset table untuk ELEMENT type
        const whereClause = {
            type: 'ELEMENT',
            deletedAt: null, // Hanya ambil aset yang belum dihapus
            ...(search && {
                AND: [
                    {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                ]
            })
        };

        // Fetch Assets terlebih dahulu
        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where: whereClause,
                include: {
                    workspace: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    uploadedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.asset.count({ where: whereClause })
        ]);

        // Manual join dengan Element table berdasarkan assetableId
        const assetIds = assets.map(asset => asset.assetableId).filter(Boolean);
        const elements = await prisma.element.findMany({
            where: {
                id: { in: assetIds }
            },
            include: {
                sourceFile: true,
                previewFile: true,
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Create lookup map untuk performance
        const elementMap = new Map(elements.map(el => [el.id, el]));

        // Transform assets dengan proper data structure dari Asset master table
        const transformedAssets = assets.map(asset => {
            // Asset adalah master table, Element adalah detail melalui polymorphic relation
            const element = elementMap.get(asset.assetableId);
            const sourceFile = element?.sourceFile;

            return {
                // ✅ Master data dari Asset table
                id: asset.id,
                title: asset.title,           // User-inputted title
                description: asset.description, // User description
                type: asset.type,
                assetableType: asset.assetableType,
                status: asset.status,
                visibility: asset.visibility,
                createdAt: asset.createdAt,
                workspace: asset.workspace,
                uploadedBy: asset.uploadedBy,

                // ✅ File URLs dari Element → File relationship (force CDN)
                url: sourceFile?.url ? sourceFile.url.replace(/https?:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com/, process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL) : null,
                previewUrl: (element?.previewFile?.url || sourceFile?.url) ? (element?.previewFile?.url || sourceFile?.url).replace(/https?:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com/, process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL) : null,
                thumbnailUrl: (element?.previewFile?.url || sourceFile?.url) ? (element?.previewFile?.url || sourceFile?.url).replace(/https?:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com/, process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL) : null,

                // ✅ File properties dari sourceFile
                size: sourceFile?.size,
                mime: sourceFile?.mime,
                width: sourceFile?.width,
                height: sourceFile?.height,

                // ✅ Element specific properties
                format: element?.format,
                colorable: element?.colorable,
                animated: element?.animated,
                loop: element?.loop,
                premiumLevel: element?.premiumLevel || 'FREE',

                // ✅ Relations
                tags: element?.tags || [],
                categories: element?.categories || [],
                element: element
            };
        });

        res.status(200).json({
            files: transformedAssets, // Keep same response structure for frontend compatibility
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("GET assets/element-files error:", error);
        res.status(500).json({
            error: "Gagal mengambil element assets",
            message: error.message
        });
    }
}