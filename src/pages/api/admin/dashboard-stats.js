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

        // Get current date for today's data
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        // Get 7 days ago for weekly data
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Total Assets
        const totalAssets = await prisma.asset.count({
            where: {
                deletedAt: null
            }
        });

        // 2. Total Templates (from assets where type = TEMPLATE)
        const totalTemplates = await prisma.asset.count({
            where: {
                type: 'TEMPLATE',
                deletedAt: null
            }
        });

        // 3. Assets uploaded today
        const assetsToday = await prisma.asset.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                deletedAt: null
            }
        });

        // 4. Templates uploaded today
        const templatesToday = await prisma.asset.count({
            where: {
                type: 'TEMPLATE',
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                deletedAt: null
            }
        });

        // 5. Calculate storage size from File table
        const filesStats = await prisma.file.aggregate({
            _sum: {
                size: true
            }
        });

        const totalBytes = filesStats._sum.size || 0;
        const totalStorageSize = formatFileSize(totalBytes);

        // 6. Assets by premium level (Pro vs Free)
        const assetsByPremiumLevel = await prisma.asset.groupBy({
            by: ['assetableType'],
            _count: {
                id: true
            },
            where: {
                deletedAt: null
            }
        });

        // Get premium levels from each asset type
        const proAssets = await prisma.template.count({
            where: {
                premiumLevel: {
                    in: ['PRO', 'PREMIUM']
                }
            }
        }) + await prisma.element.count({
            where: {
                premiumLevel: {
                    in: ['PRO', 'PREMIUM']
                }
            }
        }) + await prisma.photo.count({
            where: {
                premiumLevel: {
                    in: ['PRO', 'PREMIUM']
                }
            }
        }) + await prisma.video.count({
            where: {
                premiumLevel: {
                    in: ['PRO', 'PREMIUM']
                }
            }
        }) + await prisma.font.count({
            where: {
                premiumLevel: {
                    in: ['PRO', 'PREMIUM']
                }
            }
        });

        const freeAssets = totalAssets - proAssets;

        // 7. Weekly activity data (last 7 days)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDate = new Date(startOfDate.getTime() + 24 * 60 * 60 * 1000);

            const [dayAssets, dayTemplates] = await Promise.all([
                prisma.asset.count({
                    where: {
                        createdAt: {
                            gte: startOfDate,
                            lt: endOfDate
                        },
                        deletedAt: null
                    }
                }),
                prisma.asset.count({
                    where: {
                        type: 'TEMPLATE',
                        createdAt: {
                            gte: startOfDate,
                            lt: endOfDate
                        },
                        deletedAt: null
                    }
                })
            ]);

            weeklyData.push({
                date: startOfDate.toISOString(),
                assets: dayAssets,
                templates: dayTemplates
            });
        }

        const dashboardData = {
            totalAssets,
            totalTemplates,
            assetsToday,
            templatesToday,
            totalStorageSize,
            assetsByType: {
                pro: proAssets,
                free: freeAssets
            },
            weeklyData
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}