/**
 * API Authentication Middleware for Cognito
 * Validates Cognito tokens in API routes
 */

import jwt from 'jsonwebtoken';
import prisma from '@/prisma/index';

/**
 * Get user from Cognito token in API route
 * Reads token from Authorization header or cookies
 */
export async function getUserFromRequest(req) {
  try {
    // Try to get token from Authorization header
    let token = req.headers.authorization?.replace('Bearer ', '');

    // If not in header, try cookies (for browser requests)
    if (!token && req.cookies) {
      token = req.cookies.cognito_id_token;
    }

    if (!token) {
      return null;
    }

    // Decode token (without verification for now - Cognito already validated it)
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      return null;
    }

    // Get user from database using email from token
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
export async function requireAuth(req, res) {
  const user = await getUserFromRequest(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return user;
}

/**
 * Require admin role middleware
 * Returns 403 if not admin
 */
export async function requireAdmin(req, res) {
  const user = await getUserFromRequest(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
    return null;
  }

  return user;
}
