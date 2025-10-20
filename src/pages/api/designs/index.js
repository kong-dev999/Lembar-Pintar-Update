
import { requireAuth } from '@/lib/auth/apiAuth';

import prisma from "@/prisma/index";

export default async function handler(req, res) {
    console.log("API /designs called with method:", req.method);

    if (req.method === "GET") {
        try {
            // Check user session
            const user = await requireAuth(req, res);

            if (!user) {
                return; // requireAuth already sent 401 response
            }

            console.log("Fetching designs from database...");
            const designs = await prisma.design.findMany({
                where: {
                    ownerId: user.id
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    workspace: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            console.log("Found designs count:", designs.length);
            res.status(200).json({
                success: true,
                designs: designs,
                total: designs.length
            });
        } catch (error) {
            console.error("Error fetching designs:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch designs"
            });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed`
        });
    }
}