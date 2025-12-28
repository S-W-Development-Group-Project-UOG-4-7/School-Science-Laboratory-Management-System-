import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth/logout - Handle user logout and update session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Update user status to OFFLINE
    await prisma.user.update({
      where: { id: userIdInt },
      data: {
        status: 'OFFLINE',
      },
    });

    // Update session with logout time if sessionId is provided
    if (sessionId) {
      const sessionIdInt = parseInt(sessionId, 10);
      if (!isNaN(sessionIdInt)) {
        // Find the most recent active session (without logout time) for this user
        const activeSession = await prisma.session.findFirst({
          where: {
            userId: userIdInt,
            logoutTime: null,
          },
          orderBy: {
            loginTime: 'desc',
          },
        });

        if (activeSession) {
          // Update the session with logout time
          await prisma.session.update({
            where: { id: activeSession.id },
            data: {
              logoutTime: new Date(),
            },
          });
        }
      }
    } else {
      // If no sessionId provided, update the most recent active session
      const activeSession = await prisma.session.findFirst({
        where: {
          userId: userIdInt,
          logoutTime: null,
        },
        orderBy: {
          loginTime: 'desc',
        },
      });

      if (activeSession) {
        await prisma.session.update({
          where: { id: activeSession.id },
          data: {
            logoutTime: new Date(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during logout:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process logout',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

