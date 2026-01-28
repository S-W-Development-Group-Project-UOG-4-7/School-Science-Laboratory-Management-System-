// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession, sessionToUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    const user = sessionToUser(session);

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { user: null },
      { status: 500 }
    );
  }
}