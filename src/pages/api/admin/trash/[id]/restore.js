import prisma from "@/prisma/index";
import { getSession } from "@/lib/server/session";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
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

        let restoredItem;

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
                    message: 'Asset is not deleted'
                });
            }

            // Restore asset
            restoredItem = await prisma.asset.update({
                where: { id },
                data: {
                    deletedAt: null,
                    updatedAt: new Date()
                },
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    },
                    uploadedBy: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

        } else if (itemType === 'design') {
            // Check if design exists and is deleted
            const design = await prisma.design.findUnique({
                where: { id },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true }
                    }
                }
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
                    message: 'Design is not deleted'
                });
            }

            // Restore design
            restoredItem = await prisma.design.update({
                where: { id },
                data: {
                    deletedAt: null,
                    updatedAt: new Date()
                },
                include: {
                    workspace: {
                        select: { id: true, name: true, slug: true }
                    },
                    owner: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid itemType. Must be "asset" or "design"'
            });
        }

        res.status(200).json({
            success: true,
            message: `${itemType === 'asset' ? 'Asset' : 'Design'} berhasil dikembalikan`,
            data: {
                ...restoredItem,
                itemType,
                restoredAt: new Date(),
                restoredBy: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email
                }
            }
        });

    } catch (error) {
        console.error('Restore item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}