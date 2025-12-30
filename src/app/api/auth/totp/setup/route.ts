// src/app/api/auth/totp/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  generateTOTPSecret,
  generateQRCode,
  generateBackupCodes,
  hashBackupCode,
} from '@/src/app/lib/totpHelper';

// POST - Initialize TOTP setup
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        email: true, 
        name: true, 
        twoFactorEnabled: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    const { secret, otpauthUrl } = generateTOTPSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    
    // Return everything to frontend
    // Note: We don't save to database yet - only after verification
    return NextResponse.json({
      success: true,
      data: {
        secret, // Base32 secret for manual entry
        qrCode, // Data URL for QR code image
        backupCodes, // Plain text backup codes (show once)
        otpauthUrl, // For debugging
      },
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup two-factor authentication' },
      { status: 500 }
    );
  }
}