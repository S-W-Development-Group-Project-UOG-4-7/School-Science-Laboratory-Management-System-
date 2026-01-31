// src/app/api/auth/totp/verify-setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  verifyTOTPToken,
  encryptSecret,
  hashBackupCode,
} from '@/app/lib/totpHelper';

// POST - Verify TOTP and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const { userId, token, secret, backupCodes } = await request.json();

    console.log('============================================');
    console.log('🔐 TOTP VERIFY-SETUP REQUEST');
    console.log('============================================');
    console.log('User ID:', userId);
    console.log('Token received:', token);
    console.log('Secret (first 10 chars):', secret?.substring(0, 10) + '...');
    console.log('Backup codes count:', backupCodes?.length);

    // Validation
    if (!userId || !token || !secret || !backupCodes) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists first
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, twoFactorEnabled: true }
    });

    if (!userExists) {
      console.error('❌ User not found with ID:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', userExists.email);
    console.log('Current 2FA status:', userExists.twoFactorEnabled);

    // Verify the token
    console.log('🔍 Verifying TOTP token...');
    const isValid = verifyTOTPToken(token, secret);
    console.log('Token verification result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 401 }
      );
    }

    // Encrypt secret and hash backup codes
    console.log('🔒 Encrypting secret...');
    const encryptedSecret = encryptSecret(secret);
    console.log('Encrypted secret (first 30 chars):', encryptedSecret.substring(0, 30) + '...');

    console.log('🔑 Hashing backup codes...');
    const hashedBackupCodes = backupCodes.map(hashBackupCode);
    console.log('Hashed backup codes count:', hashedBackupCodes.length);
    console.log('First hashed code (first 20 chars):', hashedBackupCodes[0]?.substring(0, 20) + '...');

    // Save to database and enable 2FA
    console.log('💾 Updating database...');
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      }
    });

    console.log('✅ DATABASE UPDATE SUCCESSFUL!');
    console.log('Updated user email:', updatedUser.email);
    console.log('2FA Enabled:', updatedUser.twoFactorEnabled);
    console.log('2FA Secret stored:', updatedUser.twoFactorSecret ? 'YES' : 'NO');
    console.log('Backup codes stored:', updatedUser.twoFactorBackupCodes?.length || 0);
    console.log('============================================');

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      debug: {
        userId: updatedUser.id,
        email: updatedUser.email,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      }
    });
  } catch (error) {
    console.error('============================================');
    console.error('❌ TOTP VERIFICATION ERROR');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('============================================');
    
    return NextResponse.json(
      { 
        error: 'Failed to verify two-factor authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}