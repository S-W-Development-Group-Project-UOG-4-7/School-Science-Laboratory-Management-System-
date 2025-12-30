// src/app/api/auth/totp/verify-setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyTOTPToken,
  encryptSecret,
  hashBackupCode,
} from '@/src/app/lib/totpHelper';

// POST - Verify TOTP and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const { userId, token, secret, backupCodes } = await request.json();

    if (!userId || !token || !secret || !backupCodes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 401 }
      );
    }

    // Encrypt secret and hash backup codes
    const encryptedSecret = encryptSecret(secret);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Save to database and enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify two-factor authentication' },
      { status: 500 }
    );
  }
}