import prisma from "@/prisma/index";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Cek assets
        const assets = await prisma.asset.findMany({
            include: {
                workspace: { select: { name: true } },
                uploadedBy: { select: { name: true, email: true } }
            }
        });

        // Cek elements
        const elements = await prisma.element.findMany();

        // Cek files
        const files = await prisma.file.findMany();

        return res.json({
            totalAssets: assets.length,
            totalElements: elements.length,
            totalFiles: files.length,
            assets: assets.map(asset => ({
                id: asset.id,
                title: asset.title,
                type: asset.type,
                assetableId: asset.assetableId,
                assetableType: asset.assetableType,
                workspace: asset.workspace?.name,
                uploadedBy: asset.uploadedBy?.name
            })),
            elements,
            files: files.map(file => ({
                id: file.id,
                name: file.name,
                url: file.url,
                mime: file.mime,
                size: file.size
            }))
        });

    } catch (error) {
        console.error("Check assets error:", error);
        return res.status(500).json({
            error: "Database error",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}