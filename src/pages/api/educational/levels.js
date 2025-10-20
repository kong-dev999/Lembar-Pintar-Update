// API: Get all education levels
import prisma from '@/prisma/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const levels = await prisma.educationLevel.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true
      }
    });

    res.status(200).json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('Error fetching education levels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education levels'
    });
  }
}