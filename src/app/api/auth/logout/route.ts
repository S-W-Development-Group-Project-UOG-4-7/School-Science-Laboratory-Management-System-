// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { deleteAuthCookie } from "@/app/lib/auth";

export async function POST() {
  try {
    await deleteAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}