import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import type { JWTPayload, AuthUser } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');
const JWT_ALGORITHM = 'HS384';

export interface TokenPayload {
  username: string;
  userId: string;
  token: string;
  [key: string]: unknown;
}

// Create a JWT token
export async function createToken(payload: TokenPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return `token ${jwt}`;
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Remove 'token ' prefix if present
    const jwtToken = token.startsWith('token ') ? token.slice(6) : token;

    const { payload } = await jwtVerify(jwtToken, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Get the current user from the request (reads token from cookies)
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  try {
    const user = await userService.validateToken(payload);
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  } catch {
    return null;
  }
}

// Authentication middleware wrapper for API routes
export function withAuth<T>(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse<{
        error: string;
      }>;
    }

    return handler(request, user);
  };
}

// Get user from cookies (for server components)
export async function getUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  try {
    const user = await userService.validateToken(payload);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
