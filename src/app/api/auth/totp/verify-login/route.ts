// src/app/api/auth/totp/verify-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/app/lib/prisma';
import { verifyTOTPToken, decryptSecret, hashBackupCode } from '@/src/app/lib/totpHelper';
import { setAuthCookie } from '@/src/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, token, isBackupCode } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user with 2FA settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let isValid = false;
    let warning = null;

    if (isBackupCode) {
      // Verify backup code
      const codes = user.twoFactorBackupCodes || [];
      
      // Check if the token matches any of the hashed backup codes
      // Assuming verifyBackupCode compares plain text token with hashed code
      for (const hashedCode of codes) {
        // Hash the input token and compare with stored hash
        const hashedInput = hashBackupCode(token);
        if (hashedInput === hashedCode) {
          isValid = true;
          
          // Remove used backup code
          const updatedCodes = codes.filter(code => code !== hashedCode);
          await prisma.user.update({
            where: { id: userId },
            data: { twoFactorBackupCodes: updatedCodes },
          });

          // Warn if running low on backup codes
          if (updatedCodes.length <= 2) {
            warning = `Warning: You have ${updatedCodes.length} backup codes remaining. Please generate new codes.`;
          }
          
          break;
        }
      }
    } else {
      // Verify TOTP using speakeasy
      if (user.twoFactorSecret) {
        // Decrypt the secret first
        const decryptedSecret = decryptSecret(user.twoFactorSecret);
        // Verify the token
        isValid = verifyTOTPToken(token, decryptedSecret);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 401 }
      );
    }

    // Convert role
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
      twoFactorEnabled: user.twoFactorEnabled,
    };

    // Set auth cookie after successful 2FA
    await setAuthCookie(userData);

    // Update last login
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      success: true,
      warning,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}