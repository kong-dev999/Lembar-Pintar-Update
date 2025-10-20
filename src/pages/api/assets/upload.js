import fs from "fs";
import path from "path";
import slugify from "slugify";
import formidable from "formidable";
import prisma from "@/prisma/index";
import { requireAuth } from "@/lib/auth/apiAuth";
import { createAssetDetail, handleCategoriesAndTags, createTagsFromInput } from "@/lib/helpers/asset-helpers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Disable bodyParser agar formidable bisa handle form-data
export const config = {
    api: {
        bodyParser: false,
    },
};

// S3 Configuration
function getS3Config() {
    return {
        region: process.env.AWS_REGION || 'ap-southeast-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.S3_BUCKET_NAME,
        bucketUrl: process.env.S3_BUCKET_URL
    };
}

function processForm(req) {
    return new Promise((resolve, reject) => {
        // Use temporary directory for processing before S3 upload
        const uploadDir = path.join(process.cwd(), "temp/uploads");

        // Ensure temp directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
        });
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

// Upload file to S3
async function uploadToS3(file, assetType, filename) {
    const s3Config = getS3Config();

    if (!s3Config.bucketName) {
        throw new Error('S3 bucket configuration missing');
    }

    // Generate S3 key based on asset type
    let s3Key;
    switch (assetType.toUpperCase()) {
        case 'ELEMENT':
            s3Key = `content/assets/global/elements/file/${filename}`;
            break;
        case 'PHOTO':
            s3Key = `content/assets/global/photos/file/${filename}`;
            break;
        case 'VIDEO':
            s3Key = `content/assets/global/videos/file/${filename}`;
            break;
        case 'FONT':
            s3Key = `content/assets/global/fonts/file/${filename}`;
            break;
        case 'TEMPLATE':
            s3Key = `content/assets/global/templates/file/${filename}`;
            break;
        default:
            s3Key = `content/assets/global/misc/${filename}`;
    }

    // Read file buffer
    const fileBuffer = await fs.promises.readFile(file.filepath);

    // Initialize S3 client
    const s3Client = new S3Client({
        region: s3Config.region,
        credentials: {
            accessKeyId: s3Config.accessKeyId,
            secretAccessKey: s3Config.secretAccessKey
        }
    });

    // Upload to S3
    const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream'
    });

    await s3Client.send(command);

    // Return CloudFront URL (prioritized) or S3 URL (fallback)
    const cdnUrl = process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL || s3Config.bucketUrl;
    return `${cdnUrl}/${s3Key}`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Parse form to temp directory
        const { fields, files } = await processForm(req);
        console.log("Received fields:", fields);
        console.log("Received files:", files);

        if (!files.file || (!Array.isArray(files.file) && !files.file.filepath)) {
            return res.status(400).json({ error: "File tidak ditemukan" });
        }
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        // required fields
        const requiredFields = ["type", "workspaceId"];
        for (const field of requiredFields) {
            if (!fields[field] || !fields[field][0]) {
                fs.unlinkSync(file.filepath);
                return res.status(400).json({ error: `Field ${field} harus diisi` });
            }
        }

        const assetType = fields.type[0].toUpperCase();
        const workspaceId = fields.workspaceId[0];
        // ✅ previewSize sekarang otomatis handled oleh SVGO, tidak perlu manual
        const previewSize = "medium"; // default untuk konsistensi

        // ✅ Authenticate user with Cognito token
        const user = await requireAuth(req, res);
        if (!user) {
            fs.unlinkSync(file.filepath);
            return; // requireAuth already sent 401 response
        }
        const uploadedById = user.id;

        // generate slug and rename file
        const originalName = fields.title?.[0] || file.originalFilename || "Untitled";
        const slug = `${slugify(originalName, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        })}-${Date.now()}`;

        // Generate filename for S3 upload
        const fileExtension = path.extname(file.originalFilename || '');
        const newFileName = `${slugify(originalName, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        })}-${Date.now()}${fileExtension}`;

        // Upload file to S3
        const s3Url = await uploadToS3(file, assetType, newFileName);
        console.log('📁 File uploaded to S3:', s3Url);

        // Update file object with S3 info for createAssetDetail
        file.s3Url = s3Url;
        file.s3FileName = newFileName;

        // Buat detail record berdasarkan asset type (Element, Photo, Video, dll)
        const assetDetail = await createAssetDetail(assetType, file, fields, previewSize);
        // simpan ke DB dengan assetableId yang benar
        const asset = await prisma.asset.create({
            data: {
                type: assetType,
                title: originalName,
                slug: slug,
                description: fields.description?.[0] || null,
                status: fields.status?.[0] || "PUBLISHED",
                visibility: fields.visibility?.[0] || "PUBLIC",
                assetableId: assetDetail.detailId, // ✅ gunakan ID yang benar dari detail record
                assetableType: assetType,
                isSystemAsset: fields.isSystemAsset?.[0] === "true",
                workspace: {
                    connect: { id: workspaceId },
                },
                uploadedBy: {
                    connect: { id: uploadedById }, // ✅ pakai relasi, bukan uploadedById langsung
                },
            },
        });

        // Handle categories dan tags
        let categoriesAndTags = { categories: [], tags: [] };

        // Process existing category/tag IDs
        const categoryIds = fields["categoryIds[]"] || [];
        let tagIds = fields["tagIds[]"] || [];

        // Process tags input untuk auto-create tags baru
        if (fields.tagsInput && fields.tagsInput[0]) {
            console.log("🏷️ Processing tags input:", fields.tagsInput[0]);
            const newTagIds = await createTagsFromInput(assetType, fields.tagsInput[0]);
            console.log("🏷️ Created/found tags:", newTagIds);

            // Gabungkan dengan existing tag IDs
            tagIds = [...(Array.isArray(tagIds) ? tagIds : [tagIds]), ...newTagIds];
        }

        // Process keyword tags dari frontend
        if (fields["tagNames[]"]) {
            const keywordTags = Array.isArray(fields["tagNames[]"]) ? fields["tagNames[]"] : [fields["tagNames[]"]];
            console.log("🔖 Processing keyword tags:", keywordTags);

            for (const keyword of keywordTags) {
                if (keyword) {
                    const newTagIds = await createTagsFromInput(assetType, keyword);
                    tagIds = [...tagIds, ...newTagIds];
                }
            }
        }

        // Handle categories dan tags jika ada
        if (categoryIds.length > 0 || tagIds.length > 0) {
            // Pastikan array
            const categoryIdsArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
            const tagIdsArray = Array.isArray(tagIds) ? tagIds : [tagIds];

            categoriesAndTags = await handleCategoriesAndTags(
                assetDetail.detailId,
                assetType,
                categoryIdsArray.filter(id => id), // Filter empty values
                tagIdsArray.filter(id => id) // Filter empty values
            );
        }


        // ambil data lengkap + relasi
        const completeAsset = await prisma.asset.findUnique({
            where: { id: asset.id },
            include: {
                workspace: { select: { id: true, name: true, slug: true } },
                uploadedBy: { select: { id: true, name: true, email: true } },
            },
        });

        // Cleanup temporary file after successful upload to S3
        try {
            await fs.promises.unlink(file.filepath);
            console.log('🗑️ Temporary file cleaned up');
        } catch (cleanupError) {
            console.warn('⚠️ Failed to cleanup temporary file:', cleanupError.message);
        }

        return res.status(201).json({
            success: true,
            data: {
                asset: completeAsset,
                detail: assetDetail,
                categoriesAndTags: categoriesAndTags,
            },
            message: "Asset berhasil diupload dengan relasi yang benar",
        });
    } catch (error) {
        console.error("Upload asset error:", error);

        // Cleanup temporary file on error
        const { files } = await processForm(req).catch(() => ({ files: null }));
        if (files?.file) {
            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            try {
                await fs.promises.unlink(file.filepath);
                console.log('🗑️ Temporary file cleaned up after error');
            } catch (cleanupError) {
                console.warn('⚠️ Failed to cleanup temporary file after error:', cleanupError.message);
            }
        }

        return res.status(500).json({
            success: false,
            error: "Terjadi kesalahan saat mengupload asset",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

// Cleanup Prisma connection
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
