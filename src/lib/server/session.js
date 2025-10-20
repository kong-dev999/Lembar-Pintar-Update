/**
 * Unified Server-Side Session Handler
 * Supports both NextAuth (local) and Cognito (production)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/server/auth';
import { isCognito } from '@/lib/auth/config';

/**
 * Get session for the current request
 * Automatically detects auth provider and returns appropriate session
 *
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getSession(req, res) {
  const useCognito = isCognito();

  if (useCognito) {
    // For Cognito: Check Authorization header for JWT token
    return getCognitoSession(req);
  } else {
    // For NextAuth: Use built-in session
    return getServerSession(req, res, authOptions);
  }
}

/**
 * Get Cognito session from Authorization header
 *
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object|null>} Session object or null
 */
async function getCognitoSession(req) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode JWT token (simple decode, not verifying signature here)
    // In production, you should verify the signature with AWS Cognito public keys
    const payload = decodeJWT(token);

    if (!payload) {
      return null;
    }

    // Get user role from database (Cognito token doesn't have custom attributes by default)
    let userRole = 'USER';
    try {
      const prisma = require('@/prisma/index').default;
      const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { role: true, id: true, name: true },
      });

      if (user) {
        userRole = user.role;
      }
    } catch (dbError) {
      console.warn('Failed to fetch user role from DB:', dbError);
    }

    // Return session in NextAuth-compatible format
    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email?.split('@')[0],
        role: userRole,
      },
      expires: new Date(payload.exp * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error getting Cognito session:', error);
    return null;
  }
}

/**
 * Simple JWT decoder (does NOT verify signature)
 * For production, use proper JWT verification with AWS Cognito public keys
 *
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to validate session
 * Returns 401 if no valid session exists
 *
 * @returns {Function} Express-style middleware
 */
export const requireAuth = () => {
  return async (req, res, next) => {
    const session = await getSession(req, res);

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    // Pass session to next handler
    return next(session);
  };
};

/**
 * Middleware to validate admin role
 * Returns 403 if user is not admin
 *
 * @returns {Function} Express-style middleware
 */
export const requireAdmin = () => {
  return async (req, res, next) => {
    const session = await getSession(req, res);

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    const userRole = session.user?.role?.toUpperCase();
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    return next(session);
  };
};

export default getSession;
