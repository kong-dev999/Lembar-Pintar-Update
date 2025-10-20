// /pages/api/assets/index.js
import prisma from "@/prisma/index";

// Helper untuk parsing integer dengan default
const parseIntWithDefault = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const {
            type,
            categoryIds,
            tagIds,
            search,
            workspaceId,
            status,
            visibility,
            page = 1,
            limit = 20
        } = req.query;

        const pageNumber = parseIntWithDefault(page, 1);
        const limitNumber = parseIntWithDefault(limit, 20);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;

        const where = {
            deletedAt: null,
            ...(type && { type: type.toUpperCase() }),
            ...(workspaceId && { workspaceId }),
            ...(status && { status }),
            ...(visibility && { visibility }),
        };

        // Jika ada search, tambahkan pencarian ke where
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Handle categoryIds dan tagIds filtering
        const categoryFilter = categoryIds
            ? { some: { id: { in: Array.isArray(categoryIds) ? categoryIds : [categoryIds] } } }
            : undefined;

        const tagFilter = tagIds
            ? { some: { id: { in: Array.isArray(tagIds) ? tagIds : [tagIds] } } }
            : undefined;

        // Tambahkan filter berdasarkan assetableType
        if (categoryFilter || tagFilter) {
            const assetableConditions = {};

            if (categoryFilter) {
                switch (type?.toUpperCase()) {
                    case 'TEMPLATE':
                        assetableConditions.template = { categories: categoryFilter };
                        break;
                    case 'ELEMENT':
                        assetableConditions.element = { categories: categoryFilter };
                        break;
                    case 'PHOTO':
                        assetableConditions.photo = { categories: categoryFilter };
                        break;
                    case 'VIDEO':
                        assetableConditions.video = { categories: categoryFilter };
                        break;
                    case 'FONT':
                        // Font mungkin tidak punya categories, sesuaikan jika perlu
                        break;
                    default:
                        // Jika tidak ada type spesifik, filter di semua tipe
                        assetableConditions.OR = [
                            { template: { categories: categoryFilter } },
                            { element: { categories: categoryFilter } },
                            { photo: { categories: categoryFilter } },
                            { video: { categories: categoryFilter } }
                        ];
                }
            }

            if (tagFilter) {
                switch (type?.toUpperCase()) {
                    case 'TEMPLATE':
                        assetableConditions.template = {
                            ...assetableConditions.template,
                            tags: tagFilter
                        };
                        break;
                    case 'ELEMENT':
                        assetableConditions.element = {
                            ...assetableConditions.element,
                            tags: tagFilter
                        };
                        break;
                    case 'PHOTO':
                        assetableConditions.photo = {
                            ...assetableConditions.photo,
                            tags: tagFilter
                        };
                        break;
                    case 'VIDEO':
                        assetableConditions.video = {
                            ...assetableConditions.video,
                            tags: tagFilter
                        };
                        break;
                    case 'FONT':
                        // Font mungkin tidak punya tags, sesuaikan jika perlu
                        break;
                    default:
                        // Jika tidak ada type spesifik, filter di semua tipe
                        const existingOR = assetableConditions.OR || [];
                        assetableConditions.OR = [
                            ...existingOR,
                            { template: { tags: tagFilter } },
                            { element: { tags: tagFilter } },
                            { photo: { tags: tagFilter } },
                            { video: { tags: tagFilter } }
                        ];
                }
            }

            where.assetable = assetableConditions;
        }

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where,
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    },
                    uploadedBy: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.asset.count({ where })
        ]);

        // Ambil detail berdasarkan assetableType
        const transformedAssets = await Promise.all(
            assets.map(async (asset) => {
                let detail = null;

                switch (asset.assetableType) {
                    case 'Template':
                        detail = await prisma.template.findUnique({
                            where: { id: asset.assetableId },
                            include: { categories: true, tags: true }
                        });
                        break;
                    case 'Element':
                        detail = await prisma.element.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                categories: true,
                                tags: true,
                                sourceFile: true,
                                previewFile: true
                            }
                        });
                        break;
                    case 'Photo':
                        detail = await prisma.photo.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                categories: true,
                                tags: true,
                                originalFile: true,
                                previews: { include: { file: true } },
                                license: true
                            }
                        });
                        break;
                    case 'Video':
                        detail = await prisma.video.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                categories: true,
                                tags: true,
                                originalFile: true,
                                previews: { include: { file: true } },
                                license: true
                            }
                        });
                        break;
                    case 'Font':
                        detail = await prisma.font.findUnique({
                            where: { id: asset.assetableId },
                            include: { files: { include: { file: true } } }
                        });
                        break;
                }

                return {
                    ...asset,
                    detail
                };
            })
        );

        return res.status(200).json({
            assets: transformedAssets,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("GET assets error:", error);
        return res.status(500).json({
            error: "Gagal mengambil assets",
            message: error.message
        });
    }
}