import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/practicals/notes - Get notes for a practical session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practicalId = searchParams.get('practicalId');

    // Validation
    if (!practicalId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameter: practicalId',
        },
        { status: 400 }
      );
    }

    // Verify practical exists
    const practical = await prisma.practical.findUnique({
      where: { id: parseInt(practicalId) },
    });

    if (!practical) {
      return NextResponse.json(
        {
          success: false,
          message: 'Practical session not found',
        },
        { status: 404 }
      );
    }

    // Fetch notes for the practical
    const notes = await prisma.note.findMany({
      where: {
        practicalId: parseInt(practicalId),
      },
      include: {
        practical: {
          select: {
            id: true,
            title: true,
            subject: true,
            lab: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notes retrieved successfully',
        data: notes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch notes',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

