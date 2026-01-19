// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // If accessing protected routes without a token, redirect to home (login)
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Verify token
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    // Invalid token - clear it and redirect to login
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

// Configure which routes to protect
export const config = {
  matcher: [
    // Add any routes you want to protect here
    // For now, all routes are accessible since login/dashboard are on the same page
    // If you add separate /dashboard or /admin routes, add them here:
    // '/dashboard/:path*',
    // '/admin/:path*',
  ],
};