// File: src/app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Simple JSON file storage (replace with database in production)
const STORAGE_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');

// Initialize storage
async function initStorage() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
  if (!existsSync(USERS_FILE)) {
    await writeFile(USERS_FILE, JSON.stringify({}));
  }
}

// Read users data
async function readUsers() {
  await initStorage();
  const data = await readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write users data
async function writeUsers(users: any) {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, phone, profileImageUrl } = body;

    // Read existing users
    const users = await readUsers();

    // Update or create user
    users[userId] = {
      userId,
      fullName,
      email,
      phone,
      profileImageUrl,
      updatedAt: new Date().toISOString()
    };

    // Save to file
    await writeUsers(users);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[userId]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

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

    // Read users
    const users = await readUsers();
    const user = users[userId];

    if (!user) {
      // Return default user data if not found
      return NextResponse.json({
        success: true,
        user: {
          userId,
          fullName: 'Dr. Sarah Johnson',
          email: userId,
          phone: '+94 71 234 5678',
          role: 'laboratory technician',
          profileImageUrl: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}