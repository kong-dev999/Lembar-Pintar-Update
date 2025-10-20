// API: Get subjects by education level
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
    const subjects = await prisma.subject.findMany({
      where: {
        applicableLevels: {
          has: levelSlug.toUpperCase()
        }
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        applicableLevels: true
      }
    });

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
}