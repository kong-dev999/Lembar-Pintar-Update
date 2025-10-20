import prisma from '@/prisma/index';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    console.log('🎯 Preview API called with ID:', id);
    let templateId = id;
    let template;
    let title = 'Template';

    // Check if it's an asset ID (starts with template-) or direct template ID
    if (id.startsWith('template-')) {
      templateId = id.replace('template-', '');
      console.log('📄 Extracted template ID from asset format:', templateId);
    }

    console.log('🔍 Using templateId for lookup:', templateId);

    // Try to get template directly first with full data
    template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        width: true,
        height: true,
        pages: true, // Get pages data to analyze content
        thumbnailUrl: true // Get stored thumbnail URL
      }
    });

    // If not found, try as asset ID (fallback for old system)
    if (!template) {
      console.log('🔄 Template not found directly, trying as asset ID...');

      const asset = await prisma.asset.findUnique({
        where: { id },
        select: {
          assetableId: true,
          assetableType: true,
          title: true
        }
      });

      if (asset && asset.assetableType === 'Template') {
        template = await prisma.template.findUnique({
          where: { id: asset.assetableId },
          select: {
            width: true,
            height: true,
            pages: true,
            thumbnailUrl: true
          }
        });
        title = asset.title || 'Template';
      }
    }

    if (!template) {
      // Fallback to placeholder image
      console.log('Template not found, returning placeholder');
      res.writeHead(302, {
        Location: '/images/template-placeholder.png'
      });
      return res.end();
    }

    // Check for stored thumbnail from S3 or database
    let foundThumbnail = null;

    // First check if template has stored thumbnailUrl (S3 URL)
    if (template.thumbnailUrl) {
      foundThumbnail = template.thumbnailUrl;
      console.log('📸 Found stored thumbnail URL:', foundThumbnail);
    } else {
      // Fallback to S3 URL pattern for legacy templates
      const fileName = id.startsWith('template-') ? `${id}-thumb.jpg` : `template-${id}-thumb.jpg`;
      foundThumbnail = `${process.env.S3_BUCKET_URL}/content/assets/global/templates/thumbnail/${fileName}`;
      console.log('📸 Using S3 fallback URL:', foundThumbnail);
    }

    if (foundThumbnail) {
      console.log('📸 Found stored thumbnail, redirecting:', foundThumbnail);
      res.writeHead(302, {
        Location: foundThumbnail
      });
      return res.end();
    }

    // If no thumbnail found, fallback to placeholder
    console.log('❌ No thumbnail found, redirecting to placeholder');
    res.writeHead(302, {
      Location: '/images/template-placeholder.png'
    });
    res.end();

  } catch (error) {
    console.error('Error getting template preview:', error);

    // Fallback to placeholder
    res.writeHead(302, {
      Location: '/images/template-placeholder.png'
    });
    res.end();
  }
}