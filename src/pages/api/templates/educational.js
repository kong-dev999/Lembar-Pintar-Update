// API: Get educational templates with filtering
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    levelSlug,
    gradeId,
    subjectId,
    page = 1,
    limit = 20,
    search = ''
  } = req.query;

  try {
    // Build template where condition with relations
    const templateWhere = {};

    // Educational relations filtering
    if (levelSlug) {
      templateWhere.educationLevels = {
        some: { slug: levelSlug }
      };
    }

    if (gradeId) {
      templateWhere.grades = {
        some: { id: gradeId }
      };
    }

    if (subjectId) {
      templateWhere.subjects = {
        some: { id: subjectId }
      };
    }


    // Search functionality across template-related fields
    if (search && search.trim()) {
      templateWhere.OR = [
        // Search in categories
        {
          categories: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        // Search in education levels
        {
          educationLevels: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        // Search in grades
        {
          grades: {
            some: {
              displayName: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        // Search in subjects
        {
          subjects: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    console.log('🔍 Educational API - templateWhere:', templateWhere);

    // Get templates directly with pagination and preview files
    const templates = await prisma.template.findMany({
      where: templateWhere,
      include: {
        educationLevels: {
          select: { name: true, slug: true }
        },
        grades: {
          select: { name: true, displayName: true }
        },
        subjects: {
          select: { name: true, slug: true }
        },
        categories: {
          select: { name: true, slug: true }
        },
        previews: {
          include: {
            file: {
              select: {
                url: true,
                name: true
              }
            }
          }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: [
        { id: 'desc' } // newest first
      ]
    });

    console.log('📊 Found templates directly:', templates.length);

    // Get associated assets for templates
    const templateIds = templates.map(t => t.id);
    const assets = await prisma.asset.findMany({
      where: {
        assetableId: { in: templateIds },
        assetableType: 'Template'
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Create asset lookup map
    const assetMap = assets.reduce((map, asset) => {
      map[asset.assetableId] = asset;
      return map;
    }, {});

    // Transform to match expected format
    const transformedTemplates = templates.map(template => {
      const asset = assetMap[template.id];
      const assetId = asset?.id || `template-${template.id}`;

      // Build template title with context
      let templateTitle = asset?.title || `Template ${template.id}`;
      if (!asset?.title) {
        const titleParts = [];

        if (template.educationLevels && template.educationLevels.length > 0) {
          titleParts.push(template.educationLevels[0].name);
        }

        if (template.grades && template.grades.length > 0) {
          titleParts.push(template.grades[0].displayName);
        }

        if (template.subjects && template.subjects.length > 0) {
          titleParts.push(template.subjects[0].name);
        }

        if (titleParts.length > 0) {
          templateTitle = titleParts.join(' • ');
        }
      }

      // Build description with metadata
      let description = asset?.description || '';
      if (!asset?.description) {
        const descParts = [];

        if (template.categories && template.categories.length > 0) {
          descParts.push(`Kategori: ${template.categories.map(c => c.name).join(', ')}`);
        }

        if (template.educationLevels && template.educationLevels.length > 1) {
          descParts.push(`Jenjang: ${template.educationLevels.map(l => l.name).join(', ')}`);
        }

        if (template.subjects && template.subjects.length > 1) {
          descParts.push(`Mata Pelajaran: ${template.subjects.map(s => s.name).join(', ')}`);
        }

        description = descParts.join(' | ');
      }

      return {
        id: assetId,
        title: templateTitle,
        description: description,
        slug: asset?.slug || assetId,
        thumbnailUrl: template.thumbnailUrl || `${process.env.S3_BUCKET_URL}/content/assets/global/templates/thumbnail/template-${template.id}-thumb.jpg`,
        template: template,
        uploadedBy: asset?.uploadedBy || { name: 'System', email: 'system@canvad.com' },
        createdAt: asset?.createdAt || template.createdAt || new Date()
      };
    });

    // Count total for pagination (without skip/take)
    const total = await prisma.template.count({
      where: templateWhere
    });
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log('📤 Educational API Response:', {
      templates: transformedTemplates.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages,
        hasMore: parseInt(page) < totalPages
      }
    });

    res.status(200).json({
      success: true,
      data: transformedTemplates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages,
        hasMore: parseInt(page) < totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching educational templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
}