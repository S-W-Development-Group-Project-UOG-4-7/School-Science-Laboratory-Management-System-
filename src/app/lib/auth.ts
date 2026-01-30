// src/app/lib/auth.ts
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { User } from './types';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

// Create JWT token
export async function createToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Validate and extract the required fields
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Set auth cookie (server-side)
export async function setAuthCookie(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Get session from cookie (server-side)
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

// Delete auth cookie (server-side)
export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Convert session payload to User object
export function sessionToUser(session: SessionPayload): User {
  // Normalize role to application format (lowercase, hyphenated for lab-assistant)
  const roleMap: Record<string, User['role']> = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    LAB_ASSISTANT: 'lab-assistant',
    PRINCIPAL: 'principal',
    ADMIN: 'admin',
    student: 'student',
    teacher: 'teacher',
    'lab-assistant': 'lab-assistant',
    principal: 'principal',
    admin: 'admin',
  };

  const normalizedRole = roleMap[session.role] || 'student';

  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: normalizedRole,
    twoFactorEnabled: false, // This will be fetched from DB if needed
  };
}