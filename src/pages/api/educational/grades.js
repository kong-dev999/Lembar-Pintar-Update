// API: Get grades by education level
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { levelSlug } = req.query;

  if (!levelSlug) {
    return res.status(400).json({
      success: false,
      message: 'Level slug is required'
    });
  }

  try {
    const grades = await prisma.grade.findMany({
      where: {
        educationLevel: {
          slug: levelSlug
        }
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        order: true
      }
    });

    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
}