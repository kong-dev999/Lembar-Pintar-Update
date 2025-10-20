import { requireAuth } from '@/lib/auth/apiAuth';
import prisma from '@/prisma/index';
import { saveDataURLAsFile } from '@/lib/helpers/thumbnail-helpers';

// Note: Using thumbnail-helpers.js for consistent thumbnail handling

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req, res);
    if (!user) {
      return; // requireAuth already sent 401 response
    }

    const { data, title, description, designId, workspaceId } = req.body;

    console.log('📝 Save request received:', {
      hasData: !!data,
      title,
      description,
      designId,
      workspaceId,
      bodyKeys: Object.keys(req.body)
    });

    if (!data || !title) {
      console.log('❌ Validation failed:', { hasData: !!data, hasTitle: !!title });
      return res.status(400).json({
        success: false,
        message: 'Data dan judul design wajib diisi',
        received: { hasData: !!data, hasTitle: !!title, title }
      });
    }

    // Get or create workspace for the user
    let validWorkspaceId = workspaceId;

    if (!validWorkspaceId) {
      // Try to get user's first workspace
      const userWorkspace = await prisma.workspace.findFirst({
        where: {
          OR: [
            { creatorId: user.id || 'temp-admin' },
            { members: { some: { userId: user.id || 'temp-admin' } } }
          ]
        }
      });

      if (userWorkspace) {
        validWorkspaceId = userWorkspace.id;
      } else {
        // Create default workspace for user
        const newWorkspace = await prisma.workspace.create({
          data: {
            name: 'Admin Workspace',
            slug: `admin-workspace-${Date.now()}`,
            creatorId: user.id || 'temp-admin',
          }
        });
        validWorkspaceId = newWorkspace.id;
      }
    }

    // Generate thumbnail from preview data if available
    let thumbnailUrl = null;
    if (req.body.preview && req.body.preview.startsWith('data:')) {
      try {
        // Create design ID for file naming - handle null designId properly
        const tempDesignId = designId || `new-${Date.now()}`;
        thumbnailUrl = await saveDataURLAsFile(req.body.preview, tempDesignId, 'design');
        console.log('📸 Design thumbnail saved:', thumbnailUrl);
      } catch (error) {
        console.warn('⚠️ Failed to save design thumbnail:', error.message);
        console.warn('⚠️ Thumbnail error details:', error);
        thumbnailUrl = null;
      }
    } else {
      console.log('📍 No preview data to save:', {
        hasPreview: !!req.body.preview,
        previewType: typeof req.body.preview,
        previewLength: req.body.preview ? req.body.preview.length : 0
      });
    }

    let design;

    if (designId) {
      // Check if design exists before updating
      const existingDesign = await prisma.design.findUnique({
        where: { id: designId }
      });

      if (existingDesign) {
        // Update existing design
        design = await prisma.design.update({
          where: { id: designId },
          data: {
            title: title,
            description: description,
            polotnoJson: data,
            thumbnailUrl: thumbnailUrl,
            updatedAt: new Date(),
          },
        });
      } else {
        // Design not found, create new one instead
        design = await prisma.design.create({
          data: {
            title: title,
            description: description,
            polotnoJson: data,
            thumbnailUrl: thumbnailUrl,
            workspaceId: validWorkspaceId,
            ownerId: user.id || 'temp-admin',
            status: 'DRAFT',
            visibility: 'PRIVATE',
          },
        });
      }
    } else {
      // Create new design
      design = await prisma.design.create({
        data: {
          title: title,
          description: description,
          polotnoJson: data,
          thumbnailUrl: thumbnailUrl,
          workspaceId: validWorkspaceId,
          ownerId: user.id || 'temp-admin',
          status: 'DRAFT',
          visibility: 'PRIVATE',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: designId ? 'Design berhasil diperbarui' : 'Design berhasil disimpan',
      design: {
        id: design.id,
        title: design.title,
        status: design.status,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt
      }
    });

  } catch (error) {
    console.error('Error saving admin design:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan design',
      error: error.message
    });
  }
}