import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/prisma/index";
import { createAssetDetail } from "@/lib/helpers/asset-helpers";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Ambil semua asset yang belum memiliki detail record yang benar
        const assetsToMigrate = await prisma.asset.findMany({
            where: {
                // Cari asset yang assetableId-nya tidak terdapat di tabel detail yang sesuai
                OR: [
                    {
                        type: "ELEMENT",
                        NOT: {
                            assetableId: {
                                in: await prisma.element.findMany().then(elements => elements.map(e => e.id))
                            }
                        }
                    }
                    // Bisa tambahkan untuk type lain jika diperlukan
                ]
            },
            include: {
                workspace: true,
                uploadedBy: true
            }
        });

        console.log(`🔍 Found ${assetsToMigrate.length} assets to migrate`);

        const results = [];
        let successCount = 0;
        let failedCount = 0;

        for (const asset of assetsToMigrate) {
            try {
                console.log(`🔄 Migrating asset: ${asset.title} (${asset.type})`);

                // Cari file fisik berdasarkan pattern
                const uploadsDir = path.join(process.cwd(), "public/uploads");
                const files = fs.readdirSync(uploadsDir);

                // Coba cari file yang mungkin milik asset ini
                // Berdasarkan waktu atau pattern nama
                let matchingFile = null;
                const assetCreatedTime = new Date(asset.createdAt).getTime();

                for (const filename of files) {
                    const filePath = path.join(uploadsDir, filename);
                    const stats = fs.statSync(filePath);
                    const fileTime = stats.mtime.getTime();

                    // Jika file dibuat dalam rentang waktu yang dekat dengan asset
                    if (Math.abs(fileTime - assetCreatedTime) < 60000) { // 1 menit toleransi
                        matchingFile = {
                            filepath: filePath,
                            originalFilename: filename,
                            size: stats.size,
                            mimetype: getMimeType(filename)
                        };
                        break;
                    }
                }

                if (!matchingFile) {
                    // Buat file dummy jika tidak ditemukan
                    matchingFile = {
                        filepath: path.join(uploadsDir, files[0] || "dummy.svg"), // ambil file pertama sebagai fallback
                        originalFilename: asset.title + ".svg",
                        size: 1000,
                        mimetype: "image/svg+xml"
                    };
                }

                // Buat detail record dengan createAssetDetail
                const mockFields = createMockFields(asset);
                const assetDetail = await createAssetDetail(asset.type, matchingFile, mockFields);

                // Update asset dengan assetableId yang benar
                await prisma.asset.update({
                    where: { id: asset.id },
                    data: {
                        assetableId: assetDetail.detailId
                    }
                });

                results.push({
                    assetId: asset.id,
                    title: asset.title,
                    type: asset.type,
                    status: "success",
                    detailId: assetDetail.detailId
                });

                successCount++;
                console.log(`✅ Successfully migrated: ${asset.title}`);

            } catch (error) {
                console.error(`❌ Failed to migrate ${asset.title}:`, error.message);

                results.push({
                    assetId: asset.id,
                    title: asset.title,
                    type: asset.type,
                    status: "failed",
                    error: error.message
                });

                failedCount++;
            }
        }

        return res.json({
            success: true,
            message: `Migration completed: ${successCount} success, ${failedCount} failed`,
            totalProcessed: assetsToMigrate.length,
            successCount,
            failedCount,
            results
        });

    } catch (error) {
        console.error("Migration error:", error);
        return res.status(500).json({
            success: false,
            error: "Migration failed",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

function createMockFields(asset) {
    // Buat mock fields berdasarkan asset type
    const baseFields = {
        width: ["1920"],
        height: ["1080"],
        colorable: ["true"],
        animated: ["false"]
    };

    switch (asset.type) {
        case "ELEMENT":
            return {
                ...baseFields,
                format: ["SVG"],
                colorable: ["true"],
                animated: ["false"],
                loop: ["false"]
            };
        case "PHOTO":
            return {
                ...baseFields,
                ratio: ["1.78"],
                color: ["#ffffff"]
            };
        case "VIDEO":
            return {
                ...baseFields,
                ratio: ["1.78"],
                duration: ["10"],
                fps: ["30"]
            };
        case "FONT":
            return {
                family: [asset.title],
                subsets: ['["latin"]'],
                weights: ['["400"]'],
                styles: ['["normal"]'],
                weight: ["400"],
                style: ["normal"],
                subset: ["latin"]
            };
        case "TEMPLATE":
            return {
                ...baseFields,
                unit: ["PX"],
                pages: ['[]'],
                premium: ["false"]
            };
        default:
            return baseFields;
    }
}
