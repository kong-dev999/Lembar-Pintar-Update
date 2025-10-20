// /api/assets/[id].js - Get single asset detail & Delete asset
import prisma from "@/prisma/index";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            // Fetch Asset dengan semua relasi
            const asset = await prisma.asset.findUnique({
                where: { id },
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
                }
            });

            if (!asset) {
                res.status(404).json({
                    error: "Asset not found"
                });
                return;
            }

            // Manual join dengan detail table berdasarkan assetableType dan assetableId
            let detailData = null;

            if (asset.assetableType === 'ELEMENT') {
                detailData = await prisma.element.findUnique({
                    where: { id: asset.assetableId },
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
            }
            // Tambahkan case lain untuk PHOTO, VIDEO, dll jika diperlukan

            // Transform response
            const response = {
                // Master data dari Asset table
                id: asset.id,
                title: asset.title,
                description: asset.description,
                type: asset.type,
                assetableType: asset.assetableType,
                status: asset.status,
                visibility: asset.visibility,
                createdAt: asset.createdAt,
                workspace: asset.workspace,
                uploadedBy: asset.uploadedBy,

                // File data dari detail table
                ...(detailData && {
                    url: detailData.sourceFile?.url,
                    previewUrl: detailData.previewFile?.url || detailData.sourceFile?.url,
                    thumbnailUrl: detailData.previewFile?.url || detailData.sourceFile?.url,
                    size: detailData.sourceFile?.size,
                    mime: detailData.sourceFile?.mime,
                    width: detailData.sourceFile?.width,
                    height: detailData.sourceFile?.height,

                    // Element specific properties
                    format: detailData.format,
                    colorable: detailData.colorable,
                    animated: detailData.animated,
                    loop: detailData.loop,
                    premiumLevel: detailData.premiumLevel || 'FREE',

                    // Relations
                    tags: detailData.tags || [],
                    categories: detailData.categories || []
                })
            };

            res.status(200).json({
                asset: response
            });
            return;

        } catch (error) {
            console.error("GET asset detail error:", error);
            res.status(500).json({
                error: "Failed to fetch asset detail",
                message: error.message
            });
            return;
        }
    } else if (req.method === "DELETE") {
        try {
            // Fetch Asset terlebih dahulu untuk validasi
            const asset = await prisma.asset.findUnique({
                where: { id }
            });

            if (!asset) {
                res.status(404).json({
                    error: "Asset not found"
                });
                return;
            }

            // Soft delete - hanya update deletedAt, bukan hapus permanen
            const deletedAsset = await prisma.asset.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    updatedAt: new Date()
                }
            });

            res.status(200).json({
                message: "Asset moved to trash successfully",
                asset: {
                    id: deletedAsset.id,
                    title: deletedAsset.title,
                    deletedAt: deletedAsset.deletedAt
                }
            });
            return;

        } catch (error) {
            console.error("Soft delete asset error:", error);
            res.status(500).json({
                error: "Failed to move asset to trash",
                message: error.message
            });
            return;
        }
    } else {
        res.setHeader("Allow", ["GET", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
}