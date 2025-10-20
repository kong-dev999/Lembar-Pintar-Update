// pages/api/categories.js
import prisma from "@/prisma/index";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { type } = req.query;

            // Validasi type parameter
            const validTypes = ['TEMPLATE', 'ELEMENT', 'PHOTO', 'VIDEO'];
            const assetType = type?.toUpperCase();

            if (!assetType || !validTypes.includes(assetType)) {
                // Jika tidak ada type, return semua kategori yang tersedia
                const allCategories = {};

                for (const typeName of validTypes) {
                    let categories = [];

                    switch (typeName) {
                        case 'TEMPLATE':
                            categories = await prisma.templateCategory.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'ELEMENT':
                            categories = await prisma.elementCategory.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'PHOTO':
                            categories = await prisma.photoCategory.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                        case 'VIDEO':
                            categories = await prisma.videoCategory.findMany({
                                orderBy: { name: "asc" }
                            });
                            break;
                    }

                    allCategories[typeName] = categories;
                }

                return res.json(allCategories);
            }

            // Return kategori berdasarkan tipe asset
            let categories = [];

            switch (assetType) {
                case 'TEMPLATE':
                    categories = await prisma.templateCategory.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'ELEMENT':
                    categories = await prisma.elementCategory.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'PHOTO':
                    categories = await prisma.photoCategory.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                case 'VIDEO':
                    categories = await prisma.videoCategory.findMany({
                        orderBy: { name: "asc" }
                    });
                    break;

                default:
                    return res.status(400).json({
                        error: "Invalid type parameter. Use: TEMPLATE, ELEMENT, PHOTO, or VIDEO"
                    });
            }

            res.json(categories);

        } catch (error) {
            console.error("GET categories error:", error);
            res.status(500).json({ error: "Gagal mengambil kategori" });
        }
        return;
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}