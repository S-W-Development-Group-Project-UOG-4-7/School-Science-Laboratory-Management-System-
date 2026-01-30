// src/app/api/auth/totp/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@src/app/lib/prisma';
import {
  generateTOTPSecret,
  generateQRCode,
  generateBackupCodes,
} from '@src/app/lib/totpHelper';

// POST - Initialize TOTP setup
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    console.log('============================================');
    console.log('🚀 TOTP SETUP REQUEST');
    console.log('============================================');
    console.log('User ID:', userId);

    if (!userId) {
      console.error('❌ No User ID provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true, 
        name: true, 
        twoFactorEnabled: true 
      },
    });

    console.log('User lookup result:', user ? '✅ Found' : '❌ Not found');
    if (user) {
      console.log('User email:', user.email);
      console.log('User name:', user.name);
      console.log('Current 2FA status:', user.twoFactorEnabled);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      console.log('⚠️ 2FA already enabled for this user');
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled. Please disable it first to reset.' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    console.log('🔑 Generating TOTP secret...');
    const { secret, otpauthUrl } = generateTOTPSecret(user.email);
    console.log('Secret generated (first 10 chars):', secret.substring(0, 10) + '...');
    console.log('OTP Auth URL generated:', otpauthUrl ? 'YES' : 'NO');

    // Generate QR code
    console.log('📱 Generating QR code...');
    const qrCode = await generateQRCode(otpauthUrl);
    console.log('QR code generated:', qrCode ? 'YES (length: ' + qrCode.length + ')' : 'NO');

    // Generate backup codes
    console.log('🔐 Generating backup codes...');
    const backupCodes = generateBackupCodes(10);
    console.log('Backup codes generated:', backupCodes.length);
    console.log('First backup code:', backupCodes[0]);
    
    console.log('✅ SETUP SUCCESSFUL - Sending to client');
    console.log('============================================');
    
    // Return everything to frontend
    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCode,
        backupCodes,
        otpauthUrl,
      },
    });
  } catch (error) {
    console.error('============================================');
    console.error('❌ TOTP SETUP ERROR');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('============================================');
    
    return NextResponse.json(
      { error: 'Failed to setup two-factor authentication' },
      { status: 500 }
    );
  }
}