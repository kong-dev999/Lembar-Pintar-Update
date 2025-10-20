// pages/api/assets/tags.js
import prisma from "@/prisma/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { type } = req.query;

            // Validasi type parameter
            const validTypes = ['TEMPLATE', 'ELEMENT', 'PHOTO', 'VIDEO'];
            const assetType = type?.toUpperCase();

            if (!assetType || !validTypes.includes(assetType)) {
                // Jika tidak ada type, return semua tags yang tersedia
                const allTags = {};

                for (const typeName of validTypes) {
                    let tags = [];

                    switch (typeName) {
                        case 'TEMPLATE':
                            tags = await prisma.templateTag.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'ELEMENT':
                            tags = await prisma.elementTag.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'PHOTO':
                            tags = await prisma.photoTag.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'VIDEO':
                            tags = await prisma.videoTag.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                    }

                    allTags[typeName] = tags;
                }

                return res.json(allTags);
            }

            // Return tags berdasarkan tipe asset
            let tags = [];

            switch (assetType) {
                case 'TEMPLATE':
                    tags = await prisma.templateTag.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'ELEMENT':
                    tags = await prisma.elementTag.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'PHOTO':
                    tags = await prisma.photoTag.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'VIDEO':
                    tags = await prisma.videoTag.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                default:
                    return res.status(400).json({
                        error: "Invalid type parameter. Use: TEMPLATE, ELEMENT, PHOTO, or VIDEO"
                    });
            }

            res.json(tags);

        } catch (error) {
            console.error("GET tags error:", error);
            res.status(500).json({ error: "Gagal mengambil tags" });
        }
        return;
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}