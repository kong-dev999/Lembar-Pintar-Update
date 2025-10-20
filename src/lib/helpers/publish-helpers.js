// publish-helpers.js - Helper functions for publishing designs as templates
import prisma from '@/prisma/index';

/**
 * Validate Polotno JSON structure
 * @param {Object} data - Polotno JSON data from store.toJSON()
 * @returns {Object} - Validation result with success and error details
 */
export function validatePolotnoJSON(data) {
  console.log('🔍 Validating Polotno JSON structure:', {
    type: typeof data,
    hasSchemaVersion: !!data?.schemaVersion,
    hasWidth: !!data?.width,
    hasHeight: !!data?.height,
    hasPages: !!data?.pages,
    pagesIsArray: Array.isArray(data?.pages)
  });

  if (!data || typeof data !== 'object' || !data.schemaVersion || !data.pages || !Array.isArray(data.pages)) {
    return {
      success: false,
      error: 'Invalid Polotno JSON structure',
      details: {
        hasData: !!data,
        hasSchemaVersion: !!data?.schemaVersion,
        hasPages: !!data?.pages,
        pagesIsArray: Array.isArray(data?.pages)
      }
    };
  }

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

  return {
    success: true,
    data: data
  };
}

/**
 * Handle educational hierarchy relations for template
 * @param {string} templateId - Template ID
 * @param {Array} educationLevels - Education level names
 * @param {Array} grades - Grade names
 * @param {Array} subjects - Subject names
 * @returns {Object} - Result with processed counts
 */
export async function handleEducationalHierarchy(templateId, { educationLevels = [], grades = [], subjects = [] } = {}) {
  const results = {
    educationLevels: 0,
    grades: 0,
    subjects: 0
  };

  try {
    // Handle education levels
    if (educationLevels && educationLevels.length > 0) {
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
        where: { id: templateId },
        data: {
          educationLevels: {
            connect: educationLevelRecords.map(el => ({ id: el.id })),
          },
        },
      });
      results.educationLevels = educationLevelRecords.length;
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
        where: { id: templateId },
        data: {
          grades: {
            connect: gradeRecords.map(g => ({ id: g.id })),
          },
        },
      });
      results.grades = gradeRecords.length;
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
        where: { id: templateId },
        data: {
          subjects: {
            connect: subjectRecords.map(s => ({ id: s.id })),
          },
        },
      });
      results.subjects = subjectRecords.length;
    }

    return results;
  } catch (error) {
    console.error('Error handling educational hierarchy:', error);
    throw error;
  }
}

/**
 * Handle template categories and tags
 * @param {string} templateId - Template ID
 * @param {Array} categories - Category names
 * @param {Array} tags - Tag names
 * @param {string} keywords - Keywords string (comma-separated)
 * @returns {Object} - Result with processed counts
 */
export async function handleTemplateMetadata(templateId, { categories = [], tags = [], keywords = '' } = {}) {
  const results = {
    categories: 0,
    tags: 0
  };

  try {
    // Handle categories
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
        where: { id: templateId },
        data: {
          categories: {
            connect: categoryRecords.map(c => ({ id: c.id })),
          },
        },
      });
      results.categories = categoryRecords.length;
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
        where: { id: templateId },
        data: {
          tags: {
            connect: tagRecords.map(t => ({ id: t.id })),
          },
        },
      });
      results.tags = tagRecords.length;
    }

    return results;
  } catch (error) {
    console.error('Error handling template metadata:', error);
    throw error;
  }
}

/**
 * Create complete template record with all relations
 * @param {Object} validatedData - Validated Polotno JSON data
 * @param {Object} metadata - Template metadata
 * @param {Object} asset - Created asset record
 * @param {string} thumbnailUrl - Thumbnail URL
 * @returns {Object} - Created template with all relations
 */
export async function createTemplateWithRelations(validatedData, metadata, asset, thumbnailUrl) {
  const {
    name,
    description,
    premium = false,
    visibility = 'PUBLIC',
    categories = [],
    tags = [],
    educationLevels = [],
    grades = [],
    subjects = [],
    keywords = '',
    designId
  } = metadata;

  try {
    // Create template in database
    const template = await prisma.template.create({
      data: {
        width: validatedData.width,
        height: validatedData.height,
        unit: validatedData.unit === 'px' ? 'PX' : validatedData.unit?.toUpperCase() || 'PX',
        pages: validatedData, // Complete Polotno JSON data
        thumbnailUrl: thumbnailUrl,
        premium: premium,
        price: premium ? undefined : undefined,
      },
    });

    // Update asset with template ID
    await prisma.asset.update({
      where: { id: asset.id },
      data: { assetableId: template.id },
    });

    // Handle educational hierarchy
    const educationalResults = await handleEducationalHierarchy(template.id, {
      educationLevels,
      grades,
      subjects
    });

    // Handle categories and tags
    const metadataResults = await handleTemplateMetadata(template.id, {
      categories,
      tags,
      keywords
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

    console.log('✅ Template created successfully:');
    console.log('- Template ID:', template.id);
    console.log('- Asset ID:', asset.id);
    console.log('- Thumbnail URL:', thumbnailUrl);
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
      educationLevels: educationalResults.educationLevels,
      grades: educationalResults.grades,
      subjects: educationalResults.subjects,
      categories: metadataResults.categories,
      tags: metadataResults.tags
    });

    return {
      template,
      asset,
      relations: {
        ...educationalResults,
        ...metadataResults
      }
    };
  } catch (error) {
    console.error('Error creating template with relations:', error);
    throw error;
  }
}