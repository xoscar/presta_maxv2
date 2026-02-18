import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/users/login'];

// Routes that should be ignored by middleware
const ignoredRoutes = ['/_next', '/favicon.ico', '/api/users/set-cookie'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files and Next.js internals
  if (ignoredRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('token')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    // API routes return 401 with RFC 7807 problem details
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          type: '/problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication is required to access this resource.',
          instance: pathname,
        },
        {
          status: 401,
          headers: { 'Content-Type': 'application/problem+json' },
        }
      );
    }
    // Other routes redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  try {
    const jwtToken = token.startsWith('token ') ? token.slice(6) : token;
    await jwtVerify(jwtToken, JWT_SECRET, {
      algorithms: ['HS384'],
    });

    return NextResponse.next();
  } catch (error) {
    // Invalid token, clear cookie and redirect
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          {
            type: '/problems/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'The provided authentication token is invalid or expired.',
            instance: pathname,
          },
          {
            status: 401,
            headers: { 'Content-Type': 'application/problem+json' },
          }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
