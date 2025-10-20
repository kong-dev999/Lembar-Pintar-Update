// API: Get template details from asset table for modal
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Asset ID is required'
    });
  }

  try {
    console.log('🔍 Loading template detail from asset with ID:', id);

    // Primary approach: Get asset directly (since modal uses asset ID)
    let asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        element: {
          include: {
            tags: {
              select: { name: true, slug: true }
            },
            categories: {
              select: { name: true, slug: true }
            }
          }
        }
      }
    });

    // If not found, try extracting template ID from asset ID format
    if (!asset && id.startsWith('template-')) {
      const templateId = id.replace('template-', '');
      console.log('📄 Trying to find asset by template ID:', templateId);

      asset = await prisma.asset.findFirst({
        where: {
          assetableId: templateId,
          assetableType: 'Template'
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          element: {
            include: {
              tags: {
                select: { name: true, slug: true }
              },
              categories: {
                select: { name: true, slug: true }
              }
            }
          }
        }
      });
    }

    if (!asset || asset.assetableType !== 'Template') {
      console.log('❌ Template asset not found');
      return res.status(404).json({
        success: false,
        message: 'Template asset not found'
      });
    }

    // Get the related template for technical details with complete information
    const template = await prisma.template.findUnique({
      where: { id: asset.assetableId },
      include: {
        educationLevels: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            order: true
          }
        },
        grades: {
          select: {
            id: true,
            name: true,
            displayName: true,
            order: true,
            educationLevelId: true
          }
        },
        subjects: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            order: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            order: true
          }
        },
        previews: {
          include: {
            file: {
              select: {
                id: true,
                name: true,
                url: true,
                size: true,
                mime: true,
                width: true,
                height: true
              }
            }
          }
        }
      }
    });

    // Build complete template detail with all available information
    const templateDetail = {
      // === PRIMARY ASSET DATA ===
      id: asset.id,
      title: asset.title || `Template ${asset.assetableId}`,
      description: asset.description || 'Tidak ada deskripsi',
      slug: asset.slug || asset.id,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl || asset.url || `${process.env.S3_BUCKET_URL}/content/assets/global/templates/thumbnail/template-${asset.assetableId}-thumb.jpg`,

      // === ASSET METADATA ===
      type: asset.type,
      mime: asset.mime,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      assetableType: asset.assetableType,
      assetableId: asset.assetableId,

      // === UPLOAD & OWNERSHIP INFO ===
      uploadedBy: asset.uploadedBy || {
        id: null,
        name: 'System',
        email: 'system@canvad.com',
        role: 'SYSTEM'
      },
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,

      // === TEMPLATE TECHNICAL DETAILS ===
      template: template ? {
        id: template.id,
        width: template.width || asset.width,
        height: template.height || asset.height,
        unit: template.unit || 'px',
        premiumLevel: template.premiumLevel || asset.element?.premiumLevel || 'FREE',

        // Educational hierarchy
        educationLevels: template.educationLevels || [],
        grades: template.grades || [],
        subjects: template.subjects || [],

        // Categorization
        categories: template.categories || [],

        // Template files
        previews: template.previews || [],

        // Template properties
        colorPalette: template.colorPalette || null,
        fontPalette: template.fontPalette || null,

        // Timestamps
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      } : {
        id: asset.assetableId,
        width: asset.width,
        height: asset.height,
        unit: 'px',
        premiumLevel: asset.element?.premiumLevel || 'FREE',
        educationLevels: [],
        grades: [],
        subjects: [],
        categories: [],
        previews: [],
        colorPalette: null,
        fontPalette: null,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
      },

      // === ELEMENT INFORMATION ===
      element: asset.element ? {
        id: asset.element.id,
        premiumLevel: asset.element.premiumLevel || 'FREE',
        format: asset.element.format,
        tags: asset.element.tags || [],
        categories: asset.element.categories || []
      } : null,

      // === COMPUTED FIELDS ===
      fileSize: asset.size ? `${(asset.size / 1024 / 1024).toFixed(2)} MB` : null,
      dimensions: (asset.width && asset.height) ? `${asset.width} × ${asset.height}` : null,
      aspectRatio: (asset.width && asset.height) ? (asset.width / asset.height).toFixed(2) : null,

      // Educational context summary
      educationalContext: template ? {
        levels: template.educationLevels?.map(l => l.name).join(', ') || 'Tidak ada',
        grades: template.grades?.map(g => g.displayName).join(', ') || 'Tidak ada',
        subjects: template.subjects?.map(s => s.name).join(', ') || 'Tidak ada',
        categories: template.categories?.map(c => c.name).join(', ') || 'Tidak ada'
      } : null,

      // Usage stats (if needed later)
      stats: {
        hasPreview: !!(asset.thumbnailUrl || asset.url),
        isEducational: template && (template.educationLevels?.length > 0 || template.grades?.length > 0),
        hasCategories: !!(template?.categories?.length > 0 || asset.element?.categories?.length > 0),
        hasTags: !!(asset.element?.tags?.length > 0)
      }
    };

    console.log('✅ Template detail loaded from asset table');
    console.log('📊 Asset data:', {
      id: asset.id,
      title: asset.title,
      type: asset.type,
      assetableType: asset.assetableType,
      assetableId: asset.assetableId,
      premiumLevel: asset.element?.premiumLevel || template?.premiumLevel
    });

    res.status(200).json({
      success: true,
      data: templateDetail
    });

  } catch (error) {
    console.error('Error loading template detail from asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load template detail',
      error: error.message
    });
  }
}