// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Convert role from database format to app format
    const roleMap: Record<string, string> = {
      'STUDENT': 'student',
      'TEACHER': 'teacher',
      'LAB_ASSISTANT': 'lab-assistant',
      'PRINCIPAL': 'principal',
      'ADMIN': 'admin',
    };

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleMap[user.role] || 'student',
    };

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      // No 2FA required, log in directly
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return NextResponse.json({
        user: userData,
        twoFactorRequired: false,
      });
    }

    // 2FA enabled, require TOTP verification
    return NextResponse.json({
      user: userData,
      twoFactorRequired: true,
      message: 'Please enter your authenticator code',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}