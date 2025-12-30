// src/app/api/auth/totp/verify-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyTOTPToken,
  decryptSecret,
  verifyBackupCode,
  removeBackupCode,
} from '@/src/app/lib/totpHelper';

// POST - Verify TOTP during login
export async function POST(request: NextRequest) {
  try {
    const { userId, token, isBackupCode } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user with 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Two-factor authentication not enabled' },
        { status: 400 }
      );
    }

    let isValid = false;

    // Check if using backup code
    if (isBackupCode) {
      isValid = verifyBackupCode(token, user.twoFactorBackupCodes);
      
      if (isValid) {
        // Remove used backup code
        const updatedBackupCodes = removeBackupCode(token, user.twoFactorBackupCodes);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: updatedBackupCodes,
            lastLogin: new Date(),
          },
        });

        // Warn user if running low on backup codes
        const remainingCodes = updatedBackupCodes.length;
        let warning = '';
        if (remainingCodes === 0) {
          warning = 'You have used your last backup code. Please generate new codes.';
        } else if (remainingCodes <= 3) {
          warning = `You have ${remainingCodes} backup codes remaining. Consider generating new codes.`;
        }

        return NextResponse.json({
          success: true,
          message: 'Login successful with backup code',
          warning,
          remainingBackupCodes: remainingCodes,
        });
      }
    } else {
      // Verify TOTP token
      const secret = decryptSecret(user.twoFactorSecret);
      isValid = verifyTOTPToken(token, secret);

      if (isValid) {
        // Update last login
        await prisma.user.update({
          where: { id: userId },
          data: { lastLogin: new Date() },
        });

        return NextResponse.json({
          success: true,
          message: 'Login successful',
        });
      }
    }

    // Invalid token
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 401 }
    );
  } catch (error) {
    console.error('TOTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}