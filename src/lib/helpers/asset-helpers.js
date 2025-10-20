import path from "path";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/prisma/index";
import { optimize } from "svgo";
import fs from "fs/promises";

// Helper untuk get CDN URL (CloudFront or S3 fallback)
function getCdnUrl() {
    return process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL;
}

// Helper untuk extract dimensi dari SVG content
function extractSVGDimensions(svgContent) {
    try {
        // Extract width dan height dari SVG tag
        const widthMatch = svgContent.match(/width\s*=\s*["']?(\d+(?:\.\d+)?)["']?/i);
        const heightMatch = svgContent.match(/height\s*=\s*["']?(\d+(?:\.\d+)?)["']?/i);

        // Extract dari viewBox jika tidak ada width/height
        const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']?[0-9.\s]+ [0-9.\s]+ (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)["']?/i);

        let width = null;
        let height = null;

        if (widthMatch) width = parseFloat(widthMatch[1]);
        if (heightMatch) height = parseFloat(heightMatch[1]);

        // Fallback ke viewBox jika tidak ada width/height
        if (!width && !height && viewBoxMatch) {
            width = parseFloat(viewBoxMatch[1]);
            height = parseFloat(viewBoxMatch[2]);
        }

        return { width, height };
    } catch (error) {
        console.error('Failed to extract SVG dimensions:', error);
        return { width: null, height: null };
    }
}

// Helper untuk extract bounds yang lebih akurat dari SVG yang sudah dioptimize
function extractBetterSVGBounds(svgContent) {
    try {
        // Extract viewBox dari optimized SVG (lebih akurat)
        const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']?([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)["']?/i);

        if (viewBoxMatch) {
            const x = parseFloat(viewBoxMatch[1]);
            const y = parseFloat(viewBoxMatch[2]);
            const width = parseFloat(viewBoxMatch[3]);
            const height = parseFloat(viewBoxMatch[4]);

            console.log(`📦 ViewBox detected: ${x} ${y} ${width} ${height}`);

            // ViewBox biasanya sudah tight setelah optimization
            return {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }

        // Fallback ke manual calculation jika tidak ada viewBox
        return calculateSVGContentBounds(svgContent);

    } catch (error) {
        console.error('Failed to extract better SVG bounds:', error);
        return null;
    }
}

// Helper untuk calculate actual content bounds dari SVG
function calculateSVGContentBounds(svgContent) {
    try {
        // Parse semua path, rect, circle, polygon, dll untuk cari bounding box
        const pathRegex = /d\s*=\s*["']([^"']+)["']/gi;
        const rectRegex = /rect[^>]*x\s*=\s*["']?([0-9.-]+)["']?[^>]*y\s*=\s*["']?([0-9.-]+)["']?[^>]*width\s*=\s*["']?([0-9.-]+)["']?[^>]*height\s*=\s*["']?([0-9.-]+)["']?/gi;
        const circleRegex = /circle[^>]*cx\s*=\s*["']?([0-9.-]+)["']?[^>]*cy\s*=\s*["']?([0-9.-]+)["']?[^>]*r\s*=\s*["']?([0-9.-]+)["']?/gi;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let hasContent = false;

        // Extract bounds dari rectangles
        let rectMatch;
        while ((rectMatch = rectRegex.exec(svgContent)) !== null) {
            const x = parseFloat(rectMatch[1]);
            const y = parseFloat(rectMatch[2]);
            const width = parseFloat(rectMatch[3]);
            const height = parseFloat(rectMatch[4]);

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
            hasContent = true;
        }

        // Extract bounds dari circles
        let circleMatch;
        while ((circleMatch = circleRegex.exec(svgContent)) !== null) {
            const cx = parseFloat(circleMatch[1]);
            const cy = parseFloat(circleMatch[2]);
            const r = parseFloat(circleMatch[3]);

            minX = Math.min(minX, cx - r);
            minY = Math.min(minY, cy - r);
            maxX = Math.max(maxX, cx + r);
            maxY = Math.max(maxY, cy + r);
            hasContent = true;
        }

        // Basic parsing untuk paths (simplified)
        let pathMatch;
        while ((pathMatch = pathRegex.exec(svgContent)) !== null) {
            const pathData = pathMatch[1];
            // Extract numbers dari path data
            const numbers = pathData.match(/[0-9.-]+/g);
            if (numbers) {
                for (let i = 0; i < numbers.length; i += 2) {
                    if (i + 1 < numbers.length) {
                        const x = parseFloat(numbers[i]);
                        const y = parseFloat(numbers[i + 1]);
                        if (!isNaN(x) && !isNaN(y)) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                            hasContent = true;
                        }
                    }
                }
            }
        }

        if (!hasContent || !isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            return null; // Tidak bisa detect content bounds
        }

        // Add 10% padding untuk safety
        const padding = Math.max((maxX - minX), (maxY - minY)) * 0.05;

        return {
            x: Math.max(0, minX - padding),
            y: Math.max(0, minY - padding),
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2)
        };

    } catch (error) {
        console.error('Failed to calculate SVG content bounds:', error);
        return null;
    }
}

// Helper untuk mendapatkan dimensi berdasarkan preview size
function getPreviewDimension(previewSize) {
    switch (previewSize) {
        case "small": return 300;
        case "medium": return 600;
        case "large": return 1200;
        default: return 600;
    }
}

// Helper untuk membuat record detail berdasarkan asset type
export async function createAssetDetail(assetType, file, fields, previewSize = "medium") {
    const detailId = uuidv4();

    switch (assetType) {
        case "ELEMENT":
            return await createElementDetail(detailId, file, fields, previewSize);
        case "PHOTO":
            return await createPhotoDetail(detailId, file, fields, previewSize);
        case "VIDEO":
            return await createVideoDetail(detailId, file, fields, previewSize);
        case "FONT":
            return await createFontDetail(detailId, file, fields, previewSize);
        case "TEMPLATE":
            return await createTemplateDetail(detailId, file, fields, previewSize);
        default:
            throw new Error(`Asset type ${assetType} tidak didukung`);
    }
}

// Helper untuk auto-create tags dari string input
export async function createTagsFromInput(assetType, tagsInput) {
    const createdTagIds = [];

    if (!tagsInput || !tagsInput.trim()) {
        return createdTagIds;
    }

    // Parse tags dari input (split by comma, trim, lowercase, unique)
    const tagNames = tagsInput
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

    const tagTableMap = {
        TEMPLATE: 'templateTag',
        ELEMENT: 'elementTag',
        PHOTO: 'photoTag',
        VIDEO: 'videoTag',
    };

    const tagTable = tagTableMap[assetType];
    if (!tagTable) {
        console.warn(`No tag table for asset type: ${assetType}`);
        return createdTagIds;
    }

    for (const tagName of tagNames) {
        try {
            // Cari tag yang sudah ada atau buat yang baru
            let tag = await prisma[tagTable].findFirst({
                where: {
                    name: {
                        equals: tagName,
                        mode: 'insensitive' // Case insensitive search
                    }
                }
            });

            // Jika belum ada, buat tag baru
            if (!tag) {
                tag = await prisma[tagTable].create({
                    data: {
                        name: tagName,
                    }
                });
                console.log(`Created new ${assetType} tag: "${tagName}"`);
            }

            createdTagIds.push(tag.id);

        } catch (error) {
            console.error(`Failed to create/find tag "${tagName}":`, error.message);
        }
    }

    return createdTagIds;
}

// Helper untuk handle categories dan tags
export async function handleCategoriesAndTags(detailId, assetType, categoryIds = [], tagIds = []) {
    const results = { categories: [], tags: [] };

    try {
        // Handle categories menggunakan Prisma connect syntax
        if (categoryIds.length > 0) {
            const detailTableMap = {
                TEMPLATE: 'template',
                ELEMENT: 'element',
                PHOTO: 'photo',
                VIDEO: 'video',
            };

            const detailTable = detailTableMap[assetType];
            if (detailTable) {
                // Connect categories ke detail record
                await prisma[detailTable].update({
                    where: { id: detailId },
                    data: {
                        categories: {
                            connect: categoryIds.map(id => ({ id }))
                        }
                    }
                });
                results.categories = categoryIds;
            }
        }

        // Handle tags menggunakan Prisma connect syntax
        if (tagIds.length > 0) {
            const detailTableMap = {
                TEMPLATE: 'template',
                ELEMENT: 'element',
                PHOTO: 'photo',
                VIDEO: 'video',
            };

            const detailTable = detailTableMap[assetType];
            if (detailTable) {
                // Connect tags ke detail record
                await prisma[detailTable].update({
                    where: { id: detailId },
                    data: {
                        tags: {
                            connect: tagIds.map(id => ({ id }))
                        }
                    }
                });
                results.tags = tagIds;
            }
        }
    } catch (error) {
        console.error("Handle categories/tags error:", error);
        // Return partial results even if some operations failed
    }

    return results;
}

async function createElementDetail(detailId, file, fields, previewSize = "medium") {
    // ✅ Jangan ambil dari fields.width/height, biar SVGO yang tentukan
    let finalWidth = null;
    let finalHeight = null;
    let processedSize = file.size;

    // Jika file adalah SVG, optimize dengan SVGO untuk auto-fit
    if (file.mimetype?.includes('svg')) {
        try {
            const svgContent = await fs.readFile(file.filepath, 'utf8');

            // Extract original dimensions dari SVG sebelum optimize
            const originalDimensions = extractSVGDimensions(svgContent);

            // Calculate actual content bounds untuk auto-crop
            const contentBounds = calculateSVGContentBounds(svgContent);

            // Gunakan content bounds jika berhasil didetect dan masuk akal (tidak lebih besar dari original)
            let actualDimensions = originalDimensions;

            if (contentBounds) {
                const contentWidth = Math.round(contentBounds.width);
                const contentHeight = Math.round(contentBounds.height);

                // Hanya gunakan content bounds jika lebih kecil atau equal dengan original (untuk crop space kosong)
                // Atau jika original dimensions tidak ada
                if (!originalDimensions.width || !originalDimensions.height ||
                    (contentWidth <= originalDimensions.width && contentHeight <= originalDimensions.height)) {
                    actualDimensions = {
                        width: contentWidth,
                        height: contentHeight
                    };
                }
            }

            // ✅ First optimize with content-bounds detection enabled
            const optimizedResult = optimize(svgContent, {
                plugins: [
                    'removeDoctype',
                    'removeXMLProcInst',
                    'removeComments',
                    'removeMetadata',
                    'removeEditorsNSData',
                    'cleanupAttrs',
                    'mergeStyles',
                    'inlineStyles',
                    'minifyStyles',
                    'cleanupIds',
                    'removeUselessDefs',
                    'cleanupNumericValues',
                    'convertColors',
                    // ⚠️ Tidak hapus viewBox dulu, biar bisa detect bounds yang akurat
                    'collapseGroups',
                    'moveGroupAttrsToElems',
                    'convertPathData',
                    'convertTransform',
                    'removeEmptyAttrs',
                    'removeEmptyText',
                    'removeEmptyContainers',
                    'mergePaths',
                    'removeUnusedNS',
                    'sortAttrs',
                    'removeTitle',
                    'removeDesc'
                ]
            });

            // ✅ Extract better bounds dari optimized SVG
            const betterBounds = extractBetterSVGBounds(optimizedResult.data);

            // Update actualDimensions dengan better bounds
            if (betterBounds && betterBounds.width > 0 && betterBounds.height > 0) {
                actualDimensions = {
                    width: Math.round(betterBounds.width),
                    height: Math.round(betterBounds.height)
                };
            }

            // ✅ Final optimization dengan removeViewBox dan removeDimensions untuk responsive
            const result = optimize(optimizedResult.data, {
                plugins: [
                    'removeViewBox',  // Remove viewBox untuk responsive
                    'removeDimensions' // Remove fixed width/height untuk auto-fit
                ]
            });

            // Auto-resize logic untuk SVG (pindah dari frontend ke sini)
            // ✅ Gunakan actualDimensions yang sudah include content bounds detection
            let optimalWidth = actualDimensions.width || finalWidth || 100;
            let optimalHeight = actualDimensions.height || finalHeight || 100;

            // Jika SVG terlalu besar, scale down dengan maintain aspect ratio
            const MAX_SIZE = 1000;
            if (optimalWidth > MAX_SIZE || optimalHeight > MAX_SIZE) {
                const ratio = Math.min(MAX_SIZE / optimalWidth, MAX_SIZE / optimalHeight);
                optimalWidth = Math.round(optimalWidth * ratio);
                optimalHeight = Math.round(optimalHeight * ratio);
            }

            // Jika SVG terlalu kecil, scale up ke minimum usable size
            const MIN_SIZE = 100;
            if (optimalWidth < MIN_SIZE && optimalHeight < MIN_SIZE) {
                const ratio = Math.max(MIN_SIZE / optimalWidth, MIN_SIZE / optimalHeight);
                optimalWidth = Math.round(optimalWidth * ratio);
                optimalHeight = Math.round(optimalHeight * ratio);
            }

            // Update final dimensions dengan hasil auto-resize
            finalWidth = optimalWidth;
            finalHeight = optimalHeight;

            // Tulis kembali SVG yang sudah di-optimize
            await fs.writeFile(file.filepath, result.data);
            processedSize = Buffer.byteLength(result.data, 'utf8');
        } catch (error) {
            console.error(`❌ Failed to optimize SVG: ${error.message}`);
        }
    }

    // Buat File record untuk source file
    const sourceFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename || "element-source",
            url: `${getCdnUrl()}/content/assets/global/elements/file/${file.s3FileName || path.basename(file.filepath)}`,
            size: processedSize,
            mime: file.mimetype || "application/octet-stream",
            width: finalWidth,
            height: finalHeight,
        }
    });

    // Untuk preview, gunakan sourceFile yang sama (tidak buat File record baru)
    // Karena untuk element, source dan preview biasanya file yang sama
    const previewFile = sourceFile;

    // Tentukan format berdasarkan mime type
    let format = "SVG";
    if (file.mimetype) {
        if (file.mimetype.includes("png")) format = "PNG";
        else if (file.mimetype.includes("jpeg") || file.mimetype.includes("jpg")) format = "JPEG";
        else if (file.mimetype.includes("gif")) format = "GIF";
        else if (file.mimetype.includes("svg")) format = "SVG";
    }

    // Buat Element record
    const element = await prisma.element.create({
        data: {
            id: detailId,
            format: format,
            colorable: fields.colorable?.[0] === "true" || false,
            animated: fields.animated?.[0] === "true" || false,
            loop: fields.loop?.[0] === "true" || null,
            sourceFileId: sourceFile.id,
            previewFileId: sourceFile.id, // Gunakan file yang sama
            premiumLevel: fields.premiumLevel?.[0] || "FREE",
        }
    });

    return {
        detailId: element.id,
        sourceFile,
        previewFile: sourceFile, // Same as source
        element
    };
}

async function createPhotoDetail(detailId, file, fields, previewSize = "medium") {
    // Create license (basic license untuk sekarang)
    let license = await prisma.license.findFirst({
        where: { name: "Basic License" }
    });

    if (!license) {
        license = await prisma.license.create({
            data: {
                name: "Basic License",
                description: "Basic usage license",
                allowPrint: true,
                allowVideo: true,
                allowResale: false,
            }
        });
    }

    // Buat File record untuk original
    const originalFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename || "photo-original",
            url: `${getCdnUrl()}/content/assets/global/photos/file/${file.s3FileName || path.basename(file.filepath)}`,
            size: file.size,
            mime: file.mimetype || "image/jpeg",
            width: parseInt(fields.width?.[0]) || null,
            height: parseInt(fields.height?.[0]) || null,
        }
    });

    // Buat Preview File record (copy dari original dengan nama berbeda)
    const previewFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename?.replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`) || `photo-preview-${previewSize}.webp`,
            url: `${getCdnUrl()}/content/assets/global/photos/preview/${(file.s3FileName || path.basename(file.filepath)).replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`)}`,
            size: Math.round(file.size * 0.3), // Estimasi size preview lebih kecil
            mime: "image/webp",
            width: getPreviewDimension(previewSize),
            height: getPreviewDimension(previewSize),
        }
    });

    // Buat Photo record
    const photo = await prisma.photo.create({
        data: {
            id: detailId,
            width: parseInt(fields.width?.[0]) || 1920,
            height: parseInt(fields.height?.[0]) || 1080,
            ratio: parseFloat(fields.ratio?.[0]) || 16 / 9,
            color: fields.color?.[0] || null,
            originalFileId: originalFile.id,
            licenseId: license.id,
            premiumLevel: fields.premiumLevel?.[0] || "FREE",
        }
    });

    // Buat PhotoPreview record
    const photoPreview = await prisma.photoPreview.create({
        data: {
            id: uuidv4(),
            photoId: photo.id,
            fileId: previewFile.id,
            size: previewSize
        }
    });

    return {
        detailId: photo.id,
        originalFile,
        previewFile,
        photo,
        photoPreview,
        license
    };
}

async function createVideoDetail(detailId, file, fields, previewSize = "medium") {
    // Sama seperti photo, tapi untuk video
    let license = await prisma.license.findFirst({
        where: { name: "Basic License" }
    });

    if (!license) {
        license = await prisma.license.create({
            data: {
                name: "Basic License",
                description: "Basic usage license",
                allowPrint: true,
                allowVideo: true,
                allowResale: false,
            }
        });
    }

    const originalFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename || "video-original",
            url: `${getCdnUrl()}/content/assets/global/videos/file/${file.s3FileName || path.basename(file.filepath)}`,
            size: file.size,
            mime: file.mimetype || "video/mp4",
            width: parseInt(fields.width?.[0]) || null,
            height: parseInt(fields.height?.[0]) || null,
        }
    });

    // Buat Preview File record untuk video thumbnail
    const previewFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename?.replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`) || `video-preview-${previewSize}.webp`,
            url: `${getCdnUrl()}/content/assets/global/videos/preview/${(file.s3FileName || path.basename(file.filepath)).replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`)}`,
            size: Math.round(file.size * 0.1), // Video preview lebih kecil
            mime: "image/webp",
            width: getPreviewDimension(previewSize),
            height: getPreviewDimension(previewSize),
        }
    });

    const video = await prisma.video.create({
        data: {
            id: detailId,
            width: parseInt(fields.width?.[0]) || 1920,
            height: parseInt(fields.height?.[0]) || 1080,
            ratio: parseFloat(fields.ratio?.[0]) || 16 / 9,
            duration: parseInt(fields.duration?.[0]) || 10,
            fps: parseInt(fields.fps?.[0]) || 30,
            originalFileId: originalFile.id,
            licenseId: license.id,
            premiumLevel: fields.premiumLevel?.[0] || "FREE",
        }
    });

    // Buat VideoPreview record
    const videoPreview = await prisma.videoPreview.create({
        data: {
            id: uuidv4(),
            videoId: video.id,
            fileId: previewFile.id,
            type: previewSize // "small", "medium", "large" digunakan sebagai type
        }
    });

    return {
        detailId: video.id,
        originalFile,
        previewFile,
        video,
        videoPreview,
        license
    };
}

async function createFontDetail(detailId, file, fields, previewSize = "medium") {
    const font = await prisma.font.create({
        data: {
            id: detailId,
            family: fields.family?.[0] || file.originalFilename?.split('.')[0] || "Custom Font",
            subsets: fields.subsets ? JSON.parse(fields.subsets[0]) : ["latin"],
            weights: fields.weights ? JSON.parse(fields.weights[0]) : ["400"],
            styles: fields.styles ? JSON.parse(fields.styles[0]) : ["normal"],
            previewText: fields.previewText?.[0] || "Almost before we knew it, we had left the ground.",
            premiumLevel: fields.premiumLevel?.[0] || "FREE",
        }
    });

    // Buat File record untuk font file
    const fontFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename || "font-file",
            url: `${getCdnUrl()}/content/assets/global/fonts/file/${file.s3FileName || path.basename(file.filepath)}`,
            size: file.size,
            mime: file.mimetype || "font/woff2",
        }
    });

    // Buat FontFile record
    const fontFileRecord = await prisma.fontFile.create({
        data: {
            id: uuidv4(),
            fontId: font.id,
            weight: fields.weight?.[0] || "400",
            style: fields.style?.[0] || "normal",
            subset: fields.subset?.[0] || "latin",
            fileId: fontFile.id,
        }
    });

    return {
        detailId: font.id,
        font,
        fontFile,
        fontFileRecord
    };
}

async function createTemplateDetail(detailId, file, fields, previewSize = "medium") {
    // Buat Preview File record untuk template thumbnail
    const previewFile = await prisma.file.create({
        data: {
            id: uuidv4(),
            name: file.originalFilename?.replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`) || `template-preview-${previewSize}.webp`,
            url: `${getCdnUrl()}/content/assets/global/templates/preview/${(file.s3FileName || path.basename(file.filepath)).replace(/\.[^/.]+$/, `_preview_${previewSize}.webp`)}`,
            size: Math.round(file.size * 0.2),
            mime: "image/webp",
            width: getPreviewDimension(previewSize),
            height: getPreviewDimension(previewSize),
        }
    });

    const template = await prisma.template.create({
        data: {
            id: detailId,
            width: parseInt(fields.width?.[0]) || 1920,
            height: parseInt(fields.height?.[0]) || 1080,
            unit: fields.unit?.[0] || "PX",
            pages: fields.pages ? JSON.parse(fields.pages[0]) : [],
            colorPalette: fields.colorPalette ? JSON.parse(fields.colorPalette[0]) : null,
            fontPalette: fields.fontPalette ? JSON.parse(fields.fontPalette[0]) : null,
            premiumLevel: fields.premiumLevel?.[0] || "FREE",
        }
    });

    // Buat TemplatePreview record
    const templatePreview = await prisma.templatePreview.create({
        data: {
            id: uuidv4(),
            templateId: template.id,
            fileId: previewFile.id,
            size: previewSize
        }
    });

    return {
        detailId: template.id,
        previewFile,
        template,
        templatePreview
    };
}