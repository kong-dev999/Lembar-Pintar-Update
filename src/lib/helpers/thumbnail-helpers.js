// // thumbnail-helpers.js
// import fs from 'fs';
// import path from 'path';

// /**
//  * Convert DataURL to file and save to public/uploads
//  * @param {string} dataURL - Base64 DataURL from canvas
//  * @param {string} id - ID for filename (template or design)
//  * @param {string} type - 'template' or 'design' for different naming
//  * @returns {Promise<string>} - File path relative to public directory
//  */
// export async function saveDataURLAsFile(dataURL, id, type = 'template') {
//   try {
//     if (!dataURL || typeof dataURL !== 'string' || !dataURL.startsWith('data:')) {
//       throw new Error('Invalid DataURL provided');
//     }

//     // Parse the DataURL
//     const matches = dataURL.match(/^data:([^;]+);base64,(.+)$/);
//     if (!matches) {
//       throw new Error('Invalid DataURL format');
//     }

//     const mimeType = matches[1];
//     const base64Data = matches[2];

//     // Determine file extension from MIME type (prioritize WebP)
//     let extension = 'webp'; // Default to WebP for best compression
//     if (mimeType.includes('webp')) extension = 'webp';
//     else if (mimeType.includes('png')) extension = 'png';
//     else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';

//     // Generate filename based on type - use legacy format for templates
//     const filename = `${type}-${id}-thumb.jpg`; // Always use .jpg for consistency with legacy

//     // Use correct path structure for templates
//     let uploadsDir, relativePath;
//     if (type === 'template') {
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assets', 'global', 'templates', 'thumbnail');
//       relativePath = `/uploads/assets/global/templates/thumbnail/${filename}`;
//     } else {
//       // For designs, use designs directory structure
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', 'global');
//       relativePath = `/uploads/designs/global/${filename}`;
//     }

//     // Ensure uploads directory exists
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     // Create full file path
//     const filePath = path.join(uploadsDir, filename);

//     // Convert base64 to buffer and save
//     const buffer = Buffer.from(base64Data, 'base64');
//     fs.writeFileSync(filePath, buffer);

//     console.log('✅ Thumbnail saved:', {
//       filename,
//       size: `${(buffer.length / 1024).toFixed(1)} KB`,
//       path: relativePath
//     });

//     return relativePath;

//   } catch (error) {
//     console.error('❌ Error saving thumbnail:', error);
//     throw new Error(`Failed to save thumbnail: ${error.message}`);
//   }
// }

// /**
//  * Generate thumbnail URL for template preview API
//  * @param {string} templateId - Template ID or asset ID
//  * @returns {string} - Preview API URL
//  */
// export function generatePreviewURL(templateId) {
//   // Handle both direct template IDs and asset IDs
//   const cleanId = templateId.startsWith('template-') ? templateId.replace('template-', '') : templateId;
//   return `/api/templates/${cleanId}/preview`;
// }

// /**
//  * Generate thumbnail from Polotno store and save as file
//  * @param {object} store - Polotno store instance
//  * @param {string} templateId - Template ID
//  * @param {string} type - 'template' or 'design'
//  * @param {object} options - Additional options for thumbnail generation
//  * @returns {Promise<string>} - Saved thumbnail path
//  */
// export async function generateAndSaveThumbnail(store, templateId, type = 'template', options = {}) {
//   try {
//     const {
//       width = 400,
//       height = 300,
//       pixelRatio = 2,
//       format = 'webp',
//       quality = 0.8
//     } = options;

//     // Generate thumbnail from current store state
//     const dataURL = store.toDataURL({
//       width,
//       height,
//       pixelRatio,
//       mimeType: `image/${format}`,
//       quality
//     });

//     // Save the thumbnail using existing helper
//     const savedPath = await saveDataURLAsFile(dataURL, templateId, type);

//     console.log('🖼️ Generated and saved thumbnail:', {
//       templateId,
//       type,
//       path: savedPath,
//       size: `${width}x${height}`,
//       format
//     });

//     return savedPath;

//   } catch (error) {
//     console.error('❌ Error generating thumbnail:', error);
//     throw new Error(`Failed to generate thumbnail: ${error.message}`);
//   }
// }

// /**
//  * Generate multiple preview files for template (thumbnail + small + medium)
//  * @param {string} dataURL - Base64 DataURL from canvas
//  * @param {string} templateId - Template ID
//  * @returns {Promise<Object>} - Generated file paths and database records
//  */
// export async function generateTemplatePreviewFiles(dataURL, templateId) {
//   try {
//     console.log('🔄 Generating multiple preview files for template:', templateId);

//     const results = {
//       thumbnailUrl: null,
//       smallPreview: null,
//       mediumPreview: null,
//       files: []
//     };

//     // 1. Generate thumbnail for admin (JPG format)
//     const thumbnailPath = await saveDataURLAsFile(dataURL, templateId, 'template');
//     results.thumbnailUrl = thumbnailPath;
//     console.log('✅ Admin thumbnail saved:', thumbnailPath);

//     // 2. Generate small preview for user list (WebP format)
//     const smallPreviewPath = await generateWebPPreview(dataURL, templateId, 'small', {
//       width: 300,
//       height: 225,
//       quality: 0.7
//     });
//     results.smallPreview = smallPreviewPath;
//     console.log('✅ Small preview saved:', smallPreviewPath.path);

//     // 3. Generate medium preview for user modal (WebP format)
//     const mediumPreviewPath = await generateWebPPreview(dataURL, templateId, 'medium', {
//       width: 600,
//       height: 450,
//       quality: 0.8
//     });
//     results.mediumPreview = mediumPreviewPath;
//     console.log('✅ Medium preview saved:', mediumPreviewPath.path);

//     results.files = [smallPreviewPath, mediumPreviewPath];

//     console.log('🎉 All preview files generated successfully');
//     return results;

//   } catch (error) {
//     console.error('❌ Error generating template preview files:', error);
//     throw new Error(`Failed to generate preview files: ${error.message}`);
//   }
// }

// /**
//  * Generate WebP preview file for user-facing previews
//  * @param {string} dataURL - Base64 DataURL from canvas
//  * @param {string} templateId - Template ID
//  * @param {string} size - 'small' or 'medium'
//  * @param {object} options - Size and quality options
//  * @returns {Promise<Object>} - File info for database storage
//  */
// async function generateWebPPreview(dataURL, templateId, size, options = {}) {
//   try {
//     const { width = 300, height = 225, quality = 0.7 } = options;

//     // Generate filename
//     const filename = `template-${templateId}-${size}.webp`;

//     // Use preview directory for user-facing files
//     const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assets', 'global', 'templates', 'preview');
//     const relativePath = `/uploads/assets/global/templates/preview/${filename}`;

//     // Ensure directory exists
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     // Parse DataURL
//     const matches = dataURL.match(/^data:([^;]+);base64,(.+)$/);
//     if (!matches) {
//       throw new Error('Invalid DataURL format');
//     }

//     const base64Data = matches[2];
//     const buffer = Buffer.from(base64Data, 'base64');

//     // Create full file path
//     const filePath = path.join(uploadsDir, filename);

//     // For now, save as-is (in production you might want to use sharp for WebP conversion)
//     fs.writeFileSync(filePath, buffer);

//     // Calculate file stats
//     const stats = fs.statSync(filePath);

//     console.log(`📸 ${size} preview saved:`, {
//       filename,
//       size: `${(stats.size / 1024).toFixed(1)} KB`,
//       dimensions: `${width}x${height}`,
//       path: relativePath
//     });

//     return {
//       filename,
//       path: relativePath,
//       size: stats.size,
//       width,
//       height,
//       mime: 'image/webp',
//       previewSize: size
//     };

//   } catch (error) {
//     console.error(`❌ Error generating ${size} preview:`, error);
//     throw error;
//   }
// }

// /**
//  * Clean up old thumbnail files
//  * @param {string} id - ID to clean up
//  * @param {string} type - 'template' or 'design'
//  */
// export function cleanupOldThumbnails(id, type = 'template') {
//   try {
//     let uploadsDir;

//     if (type === 'template') {
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assets', 'global', 'templates', 'thumbnail');
//     } else {
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', 'global');
//     }

//     if (!fs.existsSync(uploadsDir)) {
//       return;
//     }

//     const files = fs.readdirSync(uploadsDir);

//     // Find files that match the ID pattern
//     const oldFiles = files.filter(file =>
//       file.startsWith(`${type}-${id}-thumb.`)
//     );

//     oldFiles.forEach(file => {
//       const filePath = path.join(uploadsDir, file);
//       fs.unlinkSync(filePath);
//       console.log('🗑️ Cleaned up old thumbnail:', file);
//     });
//   } catch (error) {
//     console.warn('⚠️ Could not clean up old thumbnails:', error.message);
//   }
// }

// /**
//  * Check if thumbnail exists for given ID
//  * @param {string} id - Template or design ID
//  * @param {string} type - 'template' or 'design'
//  * @returns {string|null} - Thumbnail path if exists, null otherwise
//  */
// export function getThumbnailPath(id, type = 'template') {
//   try {
//     let uploadsDir, pathPrefix;

//     if (type === 'template') {
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'assets', 'global', 'templates', 'thumbnail');
//       pathPrefix = '/uploads/assets/global/templates/thumbnail';
//     } else {
//       uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', 'global');
//       pathPrefix = '/uploads/designs/global';
//     }

//     if (!fs.existsSync(uploadsDir)) {
//       return null;
//     }

//     const filename = `${type}-${id}-thumb.jpg`;
//     const filePath = path.join(uploadsDir, filename);

//     if (fs.existsSync(filePath)) {
//       return `${pathPrefix}/${filename}`;
//     }

//     return null;
//   } catch (error) {
//     console.warn('⚠️ Could not check thumbnail path:', error.message);
//     return null;
//   }
// }

// /**
//  * Validate template data before saving
//  * @param {object} templateData - Template data to validate
//  * @returns {boolean} - True if valid
//  */
// export function validateTemplateData(templateData) {
//   try {
//     // Basic structure validation
//     if (!templateData || typeof templateData !== 'object') {
//       return false;
//     }

//     // Must have required Polotno properties
//     const requiredProps = ['width', 'height', 'pages'];
//     for (const prop of requiredProps) {
//       if (!templateData.hasOwnProperty(prop)) {
//         return false;
//       }
//     }

//     // Pages must be an array
//     if (!Array.isArray(templateData.pages)) {
//       return false;
//     }

//     // Each page must have basic structure
//     for (const page of templateData.pages) {
//       if (!page || typeof page !== 'object') {
//         return false;
//       }

//       if (!page.id || !Array.isArray(page.children)) {
//         return false;
//       }
//     }

//     return true;
//   } catch (error) {
//     console.warn('⚠️ Template validation error:', error.message);
//     return false;
//   }
// }

// thumbnail-helpers.js
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Function to get S3 config (load on demand)
function getS3Config() {
  return {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
    bucketUrl: process.env.S3_BUCKET_URL, // For uploads
    cdnUrl: process.env.CLOUDFRONT_DOMAIN || process.env.S3_BUCKET_URL // For serving files
  };
}

/**
 * Convert DataURL to S3 and return public URL
 * @param {string} dataURL - Base64 DataURL from canvas
 * @param {string} id - ID for filename (template or design)
 * @param {string} type - 'template' or 'design' for different naming
 * @returns {Promise<string>} - S3 public URL
 */
export async function saveDataURLAsFile(dataURL, id, type = 'template') {
  try {
    if (!dataURL || typeof dataURL !== 'string' || !dataURL.startsWith('data:')) {
      throw new Error('Invalid DataURL provided');
    }

    // Get S3 config (load environment variables on demand)
    const s3Config = getS3Config();

    // Parse the DataURL
    const matches = dataURL.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid DataURL format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Generate filename based on type - use legacy format for templates
    const filename = `${type}-${id}-thumb.jpg`; // Always use .jpg for consistency with legacy

    // Generate S3 key based on your bucket structure
    let s3Key;
    if (type === 'template') {
      s3Key = `content/assets/global/templates/thumbnail/${filename}`;
    } else {
      // For designs, use your existing structure
      s3Key = `content/designs/global/${filename}`;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Debug: Check bucket name
    console.log('🔍 Debug - bucketName:', s3Config.bucketName);
    console.log('🔍 Debug - s3Key:', s3Key);

    if (!s3Config.bucketName) {
      throw new Error('Bucket name is undefined! Check environment variables.');
    }

    // Initialize S3 client with current config
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
      Body: buffer,
      ContentType: 'image/jpeg'
      // ACL removed - bucket uses bucket policy for public access
    });

    await s3Client.send(command);

    // Generate public URL (CloudFront if available, otherwise S3)
    const publicUrl = `${s3Config.cdnUrl}/${s3Key}`;

    console.log('✅ Thumbnail uploaded to S3:', {
      filename,
      size: `${(buffer.length / 1024).toFixed(1)} KB`,
      s3Key: s3Key,
      url: publicUrl
    });

    return publicUrl;

  } catch (error) {
    console.error('❌ Error uploading thumbnail to S3:', error);
    throw new Error(`Failed to upload thumbnail to S3: ${error.message}`);
  }
}

/**
 * Generate thumbnail URL for template preview API
 * @param {string} templateId - Template ID or asset ID
 * @returns {string} - Preview API URL
 */
export function generatePreviewURL(templateId) {
  // Handle both direct template IDs and asset IDs
  const cleanId = templateId.startsWith('template-') ? templateId.replace('template-', '') : templateId;
  return `/api/templates/${cleanId}/preview`;
}

/**
 * Generate thumbnail from Polotno store and save as file
 * @param {object} store - Polotno store instance
 * @param {string} templateId - Template ID
 * @param {string} type - 'template' or 'design'
 * @param {object} options - Additional options for thumbnail generation
 * @returns {Promise<string>} - Saved thumbnail path
 */
export async function generateAndSaveThumbnail(store, templateId, type = 'template', options = {}) {
  try {
    const {
      width = 400,
      height = 300,
      pixelRatio = 2,
      format = 'webp',
      quality = 0.8
    } = options;

    // Generate thumbnail from current store state
    const dataURL = store.toDataURL({
      width,
      height,
      pixelRatio,
      mimeType: `image/${format}`,
      quality
    });

    // Save the thumbnail using existing helper
    const savedPath = await saveDataURLAsFile(dataURL, templateId, type);

    console.log('🖼️ Generated and saved thumbnail:', {
      templateId,
      type,
      path: savedPath,
      size: `${width}x${height}`,
      format
    });

    return savedPath;

  } catch (error) {
    console.error('❌ Error generating thumbnail:', error);
    throw new Error(`Failed to generate thumbnail: ${error.message}`);
  }
}

/**
 * Generate multiple preview files for template (thumbnail + small + medium)
 * @param {string} dataURL - Base64 DataURL from canvas
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} - Generated file paths and database records
 */
export async function generateTemplatePreviewFiles(dataURL, templateId) {
  try {
    console.log('🔄 Generating multiple preview files for template:', templateId);

    const results = {
      thumbnailUrl: null,
      smallPreview: null,
      mediumPreview: null,
      files: []
    };

    // 1. Generate thumbnail for admin (JPG format)
    const thumbnailPath = await saveDataURLAsFile(dataURL, templateId, 'template');
    results.thumbnailUrl = thumbnailPath;
    console.log('✅ Admin thumbnail saved:', thumbnailPath);

    // 2. Generate small preview for user list (WebP format)
    const smallPreviewPath = await generateWebPPreview(dataURL, templateId, 'small', {
      width: 300,
      height: 225,
      quality: 0.7
    });
    results.smallPreview = smallPreviewPath;
    console.log('✅ Small preview saved:', smallPreviewPath.path);

    // 3. Generate medium preview for user modal (WebP format)
    const mediumPreviewPath = await generateWebPPreview(dataURL, templateId, 'medium', {
      width: 600,
      height: 450,
      quality: 0.8
    });
    results.mediumPreview = mediumPreviewPath;
    console.log('✅ Medium preview saved:', mediumPreviewPath.path);

    results.files = [smallPreviewPath, mediumPreviewPath];

    console.log('🎉 All preview files generated successfully');
    return results;

  } catch (error) {
    console.error('❌ Error generating template preview files:', error);
    throw new Error(`Failed to generate preview files: ${error.message}`);
  }
}

/**
 * Generate WebP preview file for user-facing previews - Upload to S3
 * @param {string} dataURL - Base64 DataURL from canvas
 * @param {string} templateId - Template ID
 * @param {string} size - 'small' or 'medium'
 * @param {object} options - Size and quality options
 * @returns {Promise<Object>} - File info for database storage
 */
async function generateWebPPreview(dataURL, templateId, size, options = {}) {
  try {
    const { width = 300, height = 225, quality = 0.7 } = options;

    // Get S3 config
    const s3Config = getS3Config();

    // Generate filename
    const filename = `template-${templateId}-${size}.webp`;

    // S3 key for template previews
    const s3Key = `content/assets/global/templates/preview/${filename}`;

    // Parse DataURL
    const matches = dataURL.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid DataURL format');
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

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
      Body: buffer,
      ContentType: 'image/webp'
    });

    await s3Client.send(command);

    // Generate CDN URL (CloudFront or S3 fallback)
    const publicUrl = `${s3Config.cdnUrl}/${s3Key}`;

    console.log(`📸 ${size} preview saved to S3:`, {
      filename,
      size: `${(buffer.length / 1024).toFixed(1)} KB`,
      dimensions: `${width}x${height}`,
      url: publicUrl
    });

    return {
      filename,
      path: publicUrl,
      size: buffer.length,
      width,
      height,
      mime: 'image/webp',
      previewSize: size
    };

  } catch (error) {
    console.error(`❌ Error generating ${size} preview:`, error);
    throw error;
  }
}

/**
 * Clean up old thumbnail files from S3
 * @param {string} id - ID to clean up
 * @param {string} type - 'template' or 'design'
 */
export async function cleanupOldThumbnails(id, type = 'template') {
  try {
    const s3Config = getS3Config();

    // Skip if S3 not configured (fallback to no cleanup)
    if (!s3Config.bucketName) {
      console.warn('⚠️ S3 not configured, skipping thumbnail cleanup');
      return;
    }

    // For S3, we would need to use ListObjects to find old files
    // For now, just log that cleanup would happen here
    console.log(`🗑️ S3 thumbnail cleanup for ${type}-${id} (implement S3 delete if needed)`);

    // TODO: Implement S3 DeleteObject if you need file cleanup
    // This would require ListObjectsV2Command to find matching files
    // Then DeleteObjectCommand for each file to delete

  } catch (error) {
    console.warn('⚠️ Could not clean up old thumbnails from S3:', error.message);
  }
}

/**
 * Generate S3 thumbnail URL for given ID
 * @param {string} id - Template or design ID
 * @param {string} type - 'template' or 'design'
 * @returns {string|null} - S3 thumbnail URL or null if S3 not configured
 */
export function getThumbnailPath(id, type = 'template') {
  try {
    const s3Config = getS3Config();

    // Return null if S3 not configured
    if (!s3Config.bucketName || !s3Config.bucketUrl) {
      console.warn('⚠️ S3 not configured, cannot generate thumbnail URL');
      return null;
    }

    const filename = `${type}-${id}-thumb.jpg`;

    // Generate S3 key based on type
    let s3Key;
    if (type === 'template') {
      s3Key = `content/assets/global/templates/thumbnail/${filename}`;
    } else {
      s3Key = `content/designs/global/${filename}`;
    }

    // Return CloudFront URL (assume file exists, CloudFront will handle 404 if not)
    return `${s3Config.cdnUrl}/${s3Key}`;
  } catch (error) {
    console.warn('⚠️ Could not check thumbnail path:', error.message);
    return null;
  }
}

/**
 * Validate template data before saving
 * @param {object} templateData - Template data to validate
 * @returns {boolean} - True if valid
 */
export function validateTemplateData(templateData) {
  try {
    // Basic structure validation
    if (!templateData || typeof templateData !== 'object') {
      return false;
    }

    // Must have required Polotno properties
    const requiredProps = ['width', 'height', 'pages'];
    for (const prop of requiredProps) {
      if (!templateData.hasOwnProperty(prop)) {
        return false;
      }
    }

    // Pages must be an array
    if (!Array.isArray(templateData.pages)) {
      return false;
    }

    // Each page must have basic structure
    for (const page of templateData.pages) {
      if (!page || typeof page !== 'object') {
        return false;
      }

      if (!page.id || !Array.isArray(page.children)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn('⚠️ Template validation error:', error.message);
    return false;
  }
}