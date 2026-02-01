// src/app/api/users/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Path to store profile data separately from Prisma
const PROFILE_DATA_DIR = path.join(process.cwd(), 'data');
const PROFILE_DATA_PATH = path.join(PROFILE_DATA_DIR, 'users.json');

// Interface for profile data
interface ProfileData {
  [userId: string]: {
    userId: string;
    fullName?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
    updatedAt: string;
  };
}

// Helper to ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(PROFILE_DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

// Helper to read profile data from JSON file
async function readProfileData(): Promise<ProfileData> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(PROFILE_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty object
    console.log('Profile data file not found, creating new one');
    return {};
  }
}

// Helper to write profile data to JSON file
async function writeProfileData(data: ProfileData): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(PROFILE_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Profile data saved successfully');
  } catch (error) {
    console.error('Error writing profile data:', error);
    throw new Error('Failed to save profile data');
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching profile for userId:', userId);

    // Fetch user from Prisma database (WITHOUT profileImageUrl)
    const dbUser = await prisma.user.findUnique({
      where: { email: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        createdDate: true,
        lastLogin: true,
        customPrivileges: true,
        revokedPrivileges: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch profile data from JSON file
    const profileData = await readProfileData();
    const userProfile = profileData[userId];

    console.log('Profile data for user:', userProfile);

    // Merge database user with profile data from JSON
    const user = {
      ...dbUser,
      profileImageUrl: userProfile?.profileImageUrl || null,
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, phone, profileImageUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating profile for userId:', userId);
    console.log('Update data:', { fullName, email, phone, profileImageUrl });

    // Build Prisma update data object (WITHOUT profileImageUrl - it doesn't exist in schema)
    const prismaUpdateData: {
      name?: string;
      email?: string;
      phone?: string | null;
    } = {};

    // Only update fields that are provided and valid for Prisma
    if (fullName !== undefined) prismaUpdateData.name = fullName;
    if (email !== undefined) prismaUpdateData.email = email;
    if (phone !== undefined) prismaUpdateData.phone = phone || null;

    // Update user in Prisma database (basic info only, NO profileImageUrl)
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { email: userId },
        data: prismaUpdateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          twoFactorEnabled: true,
          createdDate: true,
          lastLogin: true,
          customPrivileges: true,
          revokedPrivileges: true,
        },
      });

      console.log('Prisma user updated successfully');
    } catch (prismaError: any) {
      console.error('Prisma update error:', prismaError);
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      throw prismaError;
    }

    // Now update profile data in JSON file (including profileImageUrl)
    const profileData = await readProfileData();
    
    // Update or create profile entry in JSON
    profileData[userId] = {
      userId,
      fullName: fullName || updatedUser.name,
      email: email || updatedUser.email,
      phone: phone || updatedUser.phone || '',
      profileImageUrl: profileImageUrl || profileData[userId]?.profileImageUrl || '',
      updatedAt: new Date().toISOString(),
    };

    await writeProfileData(profileData);

    console.log('Profile data (JSON) updated successfully for:', userId);

    // Return merged data (Prisma user + profileImageUrl from JSON)
    const responseUser = {
      ...updatedUser,
      profileImageUrl: profileData[userId].profileImageUrl,
    };

    return NextResponse.json({
      success: true,
      user: responseUser,
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    return NextResponse.json(
      { error: 'Failed to update user profile', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (if needed)
export async function PATCH(request: NextRequest) {
  // Just reuse PUT logic for partial updates
  return PUT(request);
}