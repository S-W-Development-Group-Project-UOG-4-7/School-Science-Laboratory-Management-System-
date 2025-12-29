// src/app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager, generateOTP, sendOTP } from '@/src/app/lib/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    // Get session
    const session = SessionManager.get(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session. Please login again.' },
        { status: 401 }
      );
    }

    // Rate limiting: prevent spam (max once per minute)
    const now = Date.now();
    if (session.lastResent && now - session.lastResent < 60000) {
      const secondsRemaining = Math.ceil((60000 - (now - session.lastResent)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${secondsRemaining} seconds before requesting another OTP.` },
        { status: 429 }
      );
    }

    // Generate new OTP
    const newOTP = generateOTP();
    
    // Update session with new OTP and reset attempts
    SessionManager.update(sessionToken, {
      otp: newOTP,
      expiresAt: Date.now() + 10 * 60 * 1000, // Extend by 10 minutes
      attempts: 0,
      lastResent: now,
    });

    // Send new OTP
    await sendOTP(session.email, newOTP);

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resending OTP' },
      { status: 500 }
    );
  }
}