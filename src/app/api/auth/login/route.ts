// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SessionManager, generateOTP, sendOTP } from '@/src/app/lib/sessionManager';

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

    // Generate OTP and session token
    const otp = generateOTP();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create session
    SessionManager.create(sessionToken, {
      userId: user.id,
      otp,
      expiresAt,
      email: user.email,
      attempts: 0,
    });

    // Send OTP to user
    await sendOTP(user.email, otp);

    // Convert role from database format to app format
    const roleMap: Record<string, string> = {
      'STUDENT': 'student',
      'TEACHER': 'teacher',
      'LAB_ASSISTANT': 'lab-assistant',
      'PRINCIPAL': 'principal',
      'ADMIN': 'admin',
    };

    // Return user data and session token (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleMap[user.role] || 'student',
      },
      sessionToken,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}