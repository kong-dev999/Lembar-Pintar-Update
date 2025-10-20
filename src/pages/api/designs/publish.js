import { requireAuth } from '@/lib/auth/apiAuth';
import prisma from '@/prisma/index';
import { saveDataURLAsFile, generatePreviewURL, cleanupOldThumbnails, generateTemplatePreviewFiles } from '@/lib/helpers/thumbnail-helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate user with Cognito token
    const user = await requireAuth(req, res);
    if (!user) {
      return; // requireAuth already sent 401 response
    }

    const {
      data,
      name,
      description,
      preview,
      width = 800,
      height = 600,
      designId,
      premiumLevel = "FREE",
      visibility = 'PUBLIC',
      categories = [],
      tags = [],
      educationLevels = [],
      grades = [],
      subjects = [],
      keywords = ''
    } = req.body;

    if (!data || !name) {
      return res.status(400).json({ message: 'Data dan nama template wajib diisi' });
    }

    // Validate that we have proper Polotno JSON structure
    console.log('🔍 Received data structure:', {
      type: typeof data,
      hasSchemaVersion: !!data?.schemaVersion,
      hasWidth: !!data?.width,
      hasHeight: !!data?.height,
      hasPages: !!data?.pages,
      pagesIsArray: Array.isArray(data?.pages)
    });

    if (!data || typeof data !== 'object' || !data.schemaVersion || !data.pages || !Array.isArray(data.pages)) {
      return res.status(400).json({
        message: 'Invalid Polotno JSON structure. Please ensure you are sending complete store.toJSON() data.',
        received: {
          hasData: !!data,
          hasSchemaVersion: !!data?.schemaVersion,
          hasPages: !!data?.pages,
          pagesIsArray: Array.isArray(data?.pages)
        }
      });
    }

    // Use dimensions directly from Polotno JSON (don't override)
    const parsedWidth = Math.round(data.width);
    const parsedHeight = Math.round(data.height);

    // Get or create user's first workspace
    let workspace = await prisma.workspace.findFirst({
      where: { creatorId: user.id }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: `${user.name || 'User'}'s Workspace`,
          slug: `workspace-${user.id}-${Date.now()}`,
          creatorId: user.id,
        },
      });
    }

    // Create Asset first (polymorphic relation)
    const asset = await prisma.asset.create({
      data: {
        type: 'TEMPLATE',
        title: name,
        slug: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: description || '',
        status: 'PUBLISHED',
        visibility: visibility || 'PUBLIC',
        workspaceId: workspace.id,
        uploadedById: user.id,
        assetableType: 'Template',
        assetableId: '', // Will update after template creation
        isSystemAsset: true,
      },
    });

    // Since we already validated the Polotno JSON structure above, we can use it directly
    console.log('✅ Using Polotno JSON structure as-is');
    console.log('📋 Polotno structure details:');
    console.log('  - Schema Version:', data.schemaVersion);
    console.log('  - Canvas Size:', data.width, 'x', data.height, data.unit || 'px');
    console.log('  - DPI:', data.dpi || 72);
    console.log('  - Fonts:', data.fonts?.length || 0);
    console.log('  - Audios:', data.audios?.length || 0);
    console.log('  - Pages:', data.pages?.length || 0);

    // Log page details
    data.pages?.forEach((page, i) => {
      console.log(`    📄 Page ${i + 1}:`, {
        id: page.id || 'missing-id',
        children: Array.isArray(page.children) ? page.children.length : 'not-array',
        background: page.background || 'undefined',
        dimensions: `${page.width} x ${page.height}`,
        duration: page.duration || 'undefined'
      });
    });

    // Use the complete Polotno JSON exactly as provided by store.toJSON()
    const validatedData = data;

    // We'll generate preview files after template creation to use real template ID

    // Create template in database
    const template = await prisma.template.create({
      data: {
        width: parsedWidth,
        height: parsedHeight,
        unit: validatedData.unit === 'px' ? 'PX' : validatedData.unit?.toUpperCase() || 'PX',
        pages: validatedData, // Complete Polotno JSON data
        thumbnailUrl: null, // Will be set after preview generation
        premiumLevel: premiumLevel,
      },
    });

    // Update asset with template ID
    await prisma.asset.update({
      where: { id: asset.id },
      data: { assetableId: template.id },
    });

    // Generate preview files with actual template ID and upload to S3
    let finalThumbnailUrl = null;
    if (preview && typeof preview === 'string' && preview.startsWith('data:')) {
      try {
        // Generate all preview files using actual template ID
        const previewResults = await generateTemplatePreviewFiles(preview, template.id);
        console.log('📸 All preview files generated with template ID:', template.id);

        if (previewResults && previewResults.thumbnailUrl) {
          finalThumbnailUrl = previewResults.thumbnailUrl;

          // Update template with S3 thumbnail URL
          await prisma.template.update({
            where: { id: template.id },
            data: { thumbnailUrl: finalThumbnailUrl },
          });
          console.log('✅ Template updated with S3 thumbnail URL:', finalThumbnailUrl);

          // Save S3 preview files to database
          try {
            for (const previewFile of previewResults.files) {
              try {
                // Create File record with S3 URL
                const fileRecord = await prisma.file.create({
                  data: {
                    name: previewFile.filename,
                    url: previewFile.path, // S3 URL
                    size: previewFile.size,
                    mime: previewFile.mime,
                    width: previewFile.width,
                    height: previewFile.height
                  }
                });

                // Create TemplatePreview record
                await prisma.templatePreview.create({
                  data: {
                    templateId: template.id,
                    fileId: fileRecord.id,
                    size: previewFile.previewSize
                  }
                });

                console.log(`✅ ${previewFile.previewSize} preview saved to database:`, previewFile.path);
              } catch (previewError) {
                console.warn(`⚠️ Error processing ${previewFile.previewSize} preview:`, previewError.message);
              }
            }
          } catch (error) {
            console.warn('⚠️ Error processing preview files:', error.message);
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to generate preview files:', error.message);
      }
    }

    // If no thumbnail was generated, use API preview as fallback
    if (!finalThumbnailUrl) {
      finalThumbnailUrl = generatePreviewURL(`template-${template.id}`);
      await prisma.template.update({
        where: { id: template.id },
        data: { thumbnailUrl: finalThumbnailUrl },
      });
    }

    // Handle education levels, grades, and subjects relationships
    if (educationLevels && educationLevels.length > 0) {
      // Find or create education levels
      const educationLevelRecords = [];
      for (const levelName of educationLevels) {
        let educationLevel = await prisma.educationLevel.findUnique({
          where: { name: levelName }
        });

        if (!educationLevel) {
          educationLevel = await prisma.educationLevel.create({
            data: {
              name: levelName,
              slug: levelName.toLowerCase(),
              order: ['TK', 'SD', 'SMP', 'SMA'].indexOf(levelName) + 1,
            },
          });
        }
        educationLevelRecords.push(educationLevel);
      }

      // Connect template to education levels
      await prisma.template.update({
        where: { id: template.id },
        data: {
          educationLevels: {
            connect: educationLevelRecords.map(el => ({ id: el.id })),
          },
        },
      });
    }

    // Handle grades
    if (grades && grades.length > 0) {
      const gradeRecords = [];
      for (const gradeName of grades) {
        // Determine education level for grade
        let educationLevelName = 'SD';
        if (gradeName.includes('TK')) educationLevelName = 'TK';
        else if (['Kelas 7', 'Kelas 8', 'Kelas 9'].includes(gradeName)) educationLevelName = 'SMP';
        else if (['Kelas 10', 'Kelas 11', 'Kelas 12'].includes(gradeName)) educationLevelName = 'SMA';

        // Get or create education level
        let educationLevel = await prisma.educationLevel.findUnique({
          where: { name: educationLevelName }
        });

        if (!educationLevel) {
          educationLevel = await prisma.educationLevel.create({
            data: {
              name: educationLevelName,
              slug: educationLevelName.toLowerCase(),
              order: ['TK', 'SD', 'SMP', 'SMA'].indexOf(educationLevelName) + 1,
            },
          });
        }

        // Find or create grade
        const gradeNumber = gradeName.replace('Kelas ', '').replace('TK ', '');
        let grade = await prisma.grade.findFirst({
          where: {
            name: gradeNumber,
            educationLevelId: educationLevel.id
          }
        });

        if (!grade) {
          grade = await prisma.grade.create({
            data: {
              name: gradeNumber,
              displayName: gradeName,
              educationLevelId: educationLevel.id,
              order: parseInt(gradeNumber) || (['A', 'B'].indexOf(gradeNumber) + 1),
            },
          });
        }
        gradeRecords.push(grade);
      }

      // Connect template to grades
      await prisma.template.update({
        where: { id: template.id },
        data: {
          grades: {
            connect: gradeRecords.map(g => ({ id: g.id })),
          },
        },
      });
    }

    // Handle subjects
    if (subjects && subjects.length > 0) {
      const subjectRecords = [];
      for (const subjectName of subjects) {
        let subject = await prisma.subject.findUnique({
          where: { name: subjectName }
        });

        if (!subject) {
          // Determine applicable levels based on subject
          let applicableLevels = ['SD', 'SMP', 'SMA'];
          if (['PKn', 'Seni Budaya'].includes(subjectName)) {
            applicableLevels = ['SD', 'SMP', 'SMA'];
          }

          subject = await prisma.subject.create({
            data: {
              name: subjectName,
              slug: subjectName.toLowerCase().replace(/\s+/g, '-'),
              applicableLevels: applicableLevels,
            },
          });
        }
        subjectRecords.push(subject);
      }

      // Connect template to subjects
      await prisma.template.update({
        where: { id: template.id },
        data: {
          subjects: {
            connect: subjectRecords.map(s => ({ id: s.id })),
          },
        },
      });
    }

    // Handle categories and tags (if provided)
    if (categories && categories.length > 0) {
      const categoryRecords = [];
      for (const categoryName of categories) {
        let category = await prisma.templateCategory.findUnique({
          where: { name: categoryName }
        });

        if (!category) {
          category = await prisma.templateCategory.create({
            data: {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
            },
          });
        }
        categoryRecords.push(category);
      }

      await prisma.template.update({
        where: { id: template.id },
        data: {
          categories: {
            connect: categoryRecords.map(c => ({ id: c.id })),
          },
        },
      });
    }

    // Handle tags from keywords field
    let tagsToProcess = tags || [];
    if (typeof keywords === 'string' && keywords.trim()) {
      const keywordTags = keywords.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagsToProcess = [...tagsToProcess, ...keywordTags];
    }

    if (tagsToProcess.length > 0) {
      const tagRecords = [];
      for (const tagName of tagsToProcess) {
        let tag = await prisma.templateTag.findUnique({
          where: { name: tagName }
        });

        if (!tag) {
          tag = await prisma.templateTag.create({
            data: { name: tagName },
          });
        }
        tagRecords.push(tag);
      }

      await prisma.template.update({
        where: { id: template.id },
        data: {
          tags: {
            connect: tagRecords.map(t => ({ id: t.id })),
          },
        },
      });
    }

    console.log('✅ Template created successfully:');
    console.log('- Template ID:', template.id);
    console.log('- Asset ID:', asset.id);
    console.log('- Final Thumbnail URL:', finalThumbnailUrl);
    console.log('- Database record created with proper Polotno JSON structure');
    console.log('- Stored Polotno JSON validates as:', {
      hasSchemaVersion: !!template.pages?.schemaVersion,
      hasRootDimensions: !!(template.pages?.width && template.pages?.height),
      hasRequiredArrays: !!(template.pages?.fonts && template.pages?.audios && template.pages?.pages),
      pagesCount: Array.isArray(template.pages?.pages) ? template.pages.pages.length : 'Invalid',
      canvasSize: `${template.pages?.width}x${template.pages?.height} ${template.pages?.unit}`,
      fontsCount: template.pages?.fonts?.length || 0,
      audiosCount: template.pages?.audios?.length || 0
    });
    console.log('- Relations processed:', {
      educationLevels: educationLevels?.length || 0,
      grades: grades?.length || 0,
      subjects: subjects?.length || 0,
      categories: categories?.length || 0,
      tags: tagsToProcess?.length || 0,
      workspace: workspace.id
    });

    // If published from existing design, update design status
    if (designId) {
      await prisma.design.update({
        where: { id: designId },
        data: {
          status: 'PUBLISHED',
          updatedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template berhasil diterbitkan',
      template: {
        id: template.id,
        width: template.width,
        height: template.height,
        premiumLevel: template.premiumLevel,
      },
      asset: {
        id: asset.id,
        title: asset.title,
        slug: asset.slug,
        type: asset.type,
        visibility: asset.visibility,
      }
    });

  } catch (error) {
    console.error('Error publishing template:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menerbitkan template',
      error: error.message
    });
  }
}