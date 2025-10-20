// API: Load template JSON for Polotno
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Template ID is required'
    });
  }

  try {
    console.log('🔍 Loading template with ID:', id);

    let templateId = id;
    let template;

    // Check if it's an asset ID (starts with template-) or direct template ID
    if (id.startsWith('template-')) {
      templateId = id.replace('template-', '');
      console.log('📄 Extracted template ID from asset format:', templateId);
    }

    // Try to get template directly first
    template = await prisma.template.findUnique({
      where: { id: templateId },
      select: {
        pages: true,
        width: true,
        height: true,
        unit: true,
        colorPalette: true,
        fontPalette: true
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

      console.log('📄 Found asset:', asset);

      if (asset && asset.assetableType === 'Template') {
        template = await prisma.template.findUnique({
          where: { id: asset.assetableId },
          select: {
            pages: true,
            width: true,
            height: true,
            unit: true,
            colorPalette: true,
            fontPalette: true
          }
        });
      }
    }

    console.log('🎨 Found template:', template ? 'Yes' : 'No');
    console.log('📊 Template structure:', template ? Object.keys(template) : 'None');

    if (!template) {
      console.log('❌ Template data not found');
      return res.status(404).json({
        success: false,
        message: 'Template data not found'
      });
    }

    // Check if template.pages is already a Polotno JSON object or just pages array
    let polotnoJSON;

    if (template.pages && typeof template.pages === 'object' && template.pages.width && template.pages.pages) {
      // template.pages is already a complete Polotno JSON object
      console.log('📄 Template contains full Polotno JSON structure');
      polotnoJSON = {
        width: template.width || template.pages.width || 800,
        height: template.height || template.pages.height || 600,
        unit: template.unit || template.pages.unit || 'px',
        dpi: template.pages.dpi || 72,
        schemaVersion: template.pages.schemaVersion || 2,
        pages: template.pages.pages || [],
        fonts: template.pages.fonts || [],
        audios: template.pages.audios || [],
        ...(template.colorPalette && { colorPalette: template.colorPalette }),
        ...(template.fontPalette && { fontPalette: template.fontPalette })
      };
    } else {
      // template.pages is just pages array (old format) - convert to Polotno JSON
      console.log('📄 Template contains pages array, converting to Polotno JSON');

      let pages = template.pages;
      if (!Array.isArray(pages)) {
        console.log('⚠️ Pages is not an array, creating default page');
        pages = [
          {
            id: `page-${Date.now()}`,
            children: [],
            width: 'auto',
            height: 'auto',
            background: 'white'
          }
        ];
      }

      // Fix each page structure
      const fixedPages = pages.map((page, index) => {
        if (!page || typeof page !== 'object' || Array.isArray(page)) {
          console.log(`⚠️ Page ${index} invalid, creating default page`);
          return {
            id: `page-${index}-${Date.now()}`,
            children: [],
            width: 'auto',
            height: 'auto',
            background: 'white'
          };
        }

        return {
          id: page.id || `page-${index}-${Date.now()}`,
          children: Array.isArray(page.children) ? page.children : [],
          width: page.width || 'auto',
          height: page.height || 'auto',
          background: page.background || 'white',
          ...page
        };
      });

      // Create full Polotno JSON structure
      polotnoJSON = {
        width: template.width || 800,
        height: template.height || 600,
        unit: template.unit || 'px',
        dpi: 72,
        schemaVersion: 2,
        pages: fixedPages,
        fonts: [],
        audios: [],
        ...(template.colorPalette && { colorPalette: template.colorPalette }),
        ...(template.fontPalette && { fontPalette: template.fontPalette })
      };
    }

    // Final validation before sending
    console.log('🔍 Final Polotno JSON validation:');
    console.log('- Width:', polotnoJSON.width, 'type:', typeof polotnoJSON.width);
    console.log('- Height:', polotnoJSON.height, 'type:', typeof polotnoJSON.height);
    console.log('- Unit:', polotnoJSON.unit);
    console.log('- DPI:', polotnoJSON.dpi);
    console.log('- Schema Version:', polotnoJSON.schemaVersion);
    console.log('- Pages:', Array.isArray(polotnoJSON.pages) ? `${polotnoJSON.pages.length} pages` : 'Not array');
    console.log('- Fonts:', Array.isArray(polotnoJSON.fonts) ? `${polotnoJSON.fonts.length} fonts` : 'Not array');
    console.log('- Audios:', Array.isArray(polotnoJSON.audios) ? `${polotnoJSON.audios.length} audios` : 'Not array');

    if (Array.isArray(polotnoJSON.pages)) {
      polotnoJSON.pages.forEach((page, i) => {
        console.log(`  Page ${i}: ID=${page.id}, Size=${page.width}x${page.height}, BG=${page.background}, Children=${Array.isArray(page.children) ? page.children.length : 'Not array'}`);
      });
    }

    res.status(200).json({
      success: true,
      data: polotnoJSON
    });

  } catch (error) {
    console.error('Error loading template JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load template',
      error: error.message
    });
  }
}