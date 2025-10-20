import { NextResponse } from 'next/server';

/**
 * Middleware for Cognito Authentication
 *
 * For Cognito: All auth is handled client-side (tokens in localStorage)
 * Middleware just passes through - auth checks happen in page components
 */

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // For Cognito: Middleware doesn't enforce auth
  // Auth protection handled by useAuth hook in pages
  // Just pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Matcher for protected routes (but just passes through)
    '/admin/:path*',
    '/account/:path*',
  ],
};