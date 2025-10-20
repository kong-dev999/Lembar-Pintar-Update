// API: Get filter options for educational templates
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all education levels
    const levels = await prisma.educationLevel.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get all grades with education level info
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        order: true,
        educationLevel: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: [
        { educationLevel: { order: 'asc' } },
        { order: 'asc' }
      ]
    });

    // Get all subjects
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        applicableLevels: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📊 Filter options loaded:', {
      levels: levels.length,
      grades: grades.length,
      subjects: subjects.length
    });

    res.status(200).json({
      success: true,
      levels,
      grades,
      subjects
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options'
    });
  }
}