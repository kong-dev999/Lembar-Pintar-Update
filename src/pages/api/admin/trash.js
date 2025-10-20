import prisma from "@/prisma/index";
import { getSession } from "@/lib/server/session";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const session = await getSession(req, res);

        if (!session) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const {
            type,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        // Base where condition for deleted items
        const baseWhere = {
            deletedAt: { not: null }
        };

        // Filter by type if specified
        if (type && type !== 'all') {
            baseWhere.type = type.toUpperCase();
        }

        // Add search functionality
        if (search && search.trim()) {
            baseWhere.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Query Asset dengan include untuk dapat data lengkap
        let deletedAssetsQuery = prisma.asset.findMany({
            where: baseWhere,
            include: {
                workspace: {
                    select: { id: true, name: true, slug: true }
                },
                uploadedBy: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { deletedAt: 'desc' },
            skip,
            take: limitNumber
        });

        // Jika filter untuk element, include element dengan file
        if (type === 'element') {
            deletedAssetsQuery = prisma.asset.findMany({
                where: { ...baseWhere, type: 'ELEMENT' },
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    },
                    uploadedBy: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { deletedAt: 'desc' },
                skip,
                take: limitNumber,
            });
        }

        console.log('🗑️ Starting API query...');

        const [deletedAssets, totalAssets] = await Promise.all([
            deletedAssetsQuery,
            prisma.asset.count({ where: baseWhere })
        ]);

        console.log(`🗑️ Found ${deletedAssets.length} deleted assets, starting transform...`);

        // Get counts for each type
        const totalElements = await prisma.asset.count({
            where: {
                deletedAt: { not: null },
                type: 'ELEMENT'
            }
        });

        const totalTemplates = await prisma.asset.count({
            where: {
                deletedAt: { not: null },
                type: 'TEMPLATE'
            }
        });

        // Transform results - Ambil URL dari File table via Element/Template relation
        const transformedAssets = await Promise.all(deletedAssets.map(async (asset) => {
            let fileUrl = null;

            console.log(`🔍 Asset ${asset.id} - Type: "${asset.type}", AssetableType: "${asset.assetableType}"`);

            if (asset.assetableType === 'ELEMENT') {
                console.log(`📋 Asset ${asset.id} → Element ${asset.assetableId}`);

                const element = await prisma.element.findUnique({
                    where: { id: asset.assetableId },
                    include: {
                        sourceFile: true,
                        previewFile: true
                    }
                });

                if (element) {
                    fileUrl = element.previewFile?.url || element.sourceFile?.url;
                    console.log(`📁 Element ${asset.assetableId} → Files:`, {
                        sourceFileId: element.sourceFileId,
                        previewFileId: element.previewFileId,
                        sourceFile: element.sourceFile ? {
                            id: element.sourceFile.id,
                            url: element.sourceFile.url,
                            name: element.sourceFile.name
                        } : 'NULL',
                        previewFile: element.previewFile ? {
                            id: element.previewFile.id,
                            url: element.previewFile.url,
                            name: element.previewFile.name
                        } : 'NULL',
                        finalUrl: fileUrl || 'NULL'
                    });
                } else {
                    console.warn(`❌ Element ${asset.assetableId} NOT FOUND`);
                }
            } else if (asset.assetableType === 'TEMPLATE') {
                const templatePreview = await prisma.templatePreview.findFirst({
                    where: { templateId: asset.assetableId },
                    include: { file: true },
                    orderBy: { size: 'desc' }
                });

                if (templatePreview?.file) {
                    fileUrl = templatePreview.file.url;
                    console.log(`📁 Template ${asset.assetableId} → File URL: ${fileUrl}`);
                }
            }

            return {
                ...asset,
                itemType: asset.type.toLowerCase(),
                deletedBy: asset.uploadedBy,
                // URL sebenarnya dari File table
                previewUrl: fileUrl,
                thumbnailUrl: fileUrl,
                url: fileUrl
            };
        }));

        // Apply pagination to results (already filtered by type in baseWhere)
        const totalItems = type === 'element' ? totalElements :
            type === 'template' ? totalTemplates :
                totalAssets;

        res.status(200).json({
            success: true,
            data: {
                items: transformedAssets,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: totalItems,
                    pages: Math.ceil(totalItems / limitNumber)
                },
                summary: {
                    totalElements,
                    totalTemplates,
                    totalItems: totalElements + totalTemplates
                }
            }
        });

    } catch (error) {
        console.error('Trash list error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}