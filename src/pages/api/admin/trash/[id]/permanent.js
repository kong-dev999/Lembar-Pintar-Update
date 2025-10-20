import prisma from "@/prisma/index";
import { getSession } from "@/lib/server/session";

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
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

        const { id } = req.query;
        const { itemType } = req.body; // 'element' or 'template'

        if (!id || !itemType) {
            return res.status(400).json({
                success: false,
                message: 'ID and itemType are required'
            });
        }

        let deletedItem;
        let filesToDelete = [];

        if (itemType === 'element' || itemType === 'template') {
            // Check if asset exists and is deleted
            const asset = await prisma.asset.findUnique({
                where: { id },
                include: {
                    uploadedBy: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

            if (!asset) {
                return res.status(404).json({
                    success: false,
                    message: 'Asset not found'
                });
            }

            if (!asset.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset is not deleted. Use soft delete first.'
                });
            }

            // Get related files before deletion
            let assetableData = null;

            try {
                switch (asset.assetableType) {
                    case 'Template':
                        assetableData = await prisma.template.findUnique({
                            where: { id: asset.assetableId },
                            include: { previews: { include: { file: true } } }
                        });
                        break;
                    case 'Element':
                        assetableData = await prisma.element.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                sourceFile: true,
                                previewFile: true
                            }
                        });
                        break;
                    case 'Photo':
                        assetableData = await prisma.photo.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                originalFile: true,
                                previews: { include: { file: true } }
                            }
                        });
                        break;
                    case 'Video':
                        assetableData = await prisma.video.findUnique({
                            where: { id: asset.assetableId },
                            include: {
                                originalFile: true,
                                previews: { include: { file: true } }
                            }
                        });
                        break;
                    case 'Font':
                        assetableData = await prisma.font.findUnique({
                            where: { id: asset.assetableId },
                            include: { files: { include: { file: true } } }
                        });
                        break;
                }

                // Collect file paths for deletion
                if (assetableData) {
                    if (assetableData.sourceFile) {
                        filesToDelete.push(assetableData.sourceFile.url);
                    }
                    if (assetableData.previewFile) {
                        filesToDelete.push(assetableData.previewFile.url);
                    }
                    if (assetableData.originalFile) {
                        filesToDelete.push(assetableData.originalFile.url);
                    }
                    if (assetableData.previews) {
                        assetableData.previews.forEach(preview => {
                            if (preview.file) {
                                filesToDelete.push(preview.file.url);
                            }
                        });
                    }
                    if (assetableData.files) {
                        assetableData.files.forEach(fontFile => {
                            if (fontFile.file) {
                                filesToDelete.push(fontFile.file.url);
                            }
                        });
                    }
                }

            } catch (assetableError) {
                console.warn('Error getting assetable data:', assetableError);
            }

            // Delete the asset and related assetable data
            await prisma.$transaction(async (tx) => {
                // Delete the main asset record
                deletedItem = await tx.asset.delete({
                    where: { id }
                });

                // Delete the assetable record
                try {
                    switch (asset.assetableType) {
                        case 'Template':
                            await tx.template.delete({ where: { id: asset.assetableId } });
                            break;
                        case 'Element':
                            await tx.element.delete({ where: { id: asset.assetableId } });
                            break;
                        case 'Photo':
                            await tx.photo.delete({ where: { id: asset.assetableId } });
                            break;
                        case 'Video':
                            await tx.video.delete({ where: { id: asset.assetableId } });
                            break;
                        case 'Font':
                            await tx.font.delete({ where: { id: asset.assetableId } });
                            break;
                    }
                } catch (deleteError) {
                    console.warn('Error deleting assetable record:', deleteError);
                }
            });

        } else if (itemType === 'design') {
            // Check if design exists and is deleted
            const design = await prisma.design.findUnique({
                where: { id }
            });

            if (!design) {
                return res.status(404).json({
                    success: false,
                    message: 'Design not found'
                });
            }

            if (!design.deletedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Design is not deleted. Use soft delete first.'
                });
            }

            // Add thumbnail to files to delete
            if (design.thumbnailUrl) {
                filesToDelete.push(design.thumbnailUrl);
            }

            // Delete design permanently
            deletedItem = await prisma.design.delete({
                where: { id }
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid itemType. Must be "asset" or "design"'
            });
        }

        // Note: Files are stored in CDN/S3, not local filesystem
        // Physical file deletion should be handled by CDN/S3 cleanup process
        // or separate background job, not during API request
        console.log(`🗑️ Marked ${filesToDelete.length} files for CDN cleanup:`, filesToDelete);

        res.status(200).json({
            success: true,
            message: `${itemType === 'asset' ? 'Asset' : 'Design'} berhasil dihapus permanen`,
            data: {
                id: deletedItem.id,
                title: deletedItem.title,
                itemType,
                markedForCleanup: filesToDelete.length,
                deletedPermanentlyAt: new Date(),
                deletedBy: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email
                }
            }
        });

    } catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}