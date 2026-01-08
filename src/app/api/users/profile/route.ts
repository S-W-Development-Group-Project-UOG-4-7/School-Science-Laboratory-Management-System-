// File: src/app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, phone, profileImageUrl } = body;

    // Here you would typically:
    // 1. Validate the data
    // 2. Update your database
    // 3. Return the updated user data

    // For now, we'll just log and return success
    console.log('Profile update request:', {
      userId,
      fullName,
      email,
      phone,
      profileImageUrl
    });

    // Simulate database update
    // await db.user.update({
    //   where: { id: userId },
    //   data: { fullName, email, phone, profileImageUrl }
    // });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId,
        fullName,
        email,
        phone,
        profileImageUrl
      }
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

    // Here you would fetch from database
    // const user = await db.user.findUnique({ where: { id: userId } });

    // Mock data for now
    return NextResponse.json({
      success: true,
      user: {
        userId,
        fullName: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medlab.com',
        phone: '+94 71 234 5678',
        role: 'laboratory technician',
        profileImageUrl: null
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}