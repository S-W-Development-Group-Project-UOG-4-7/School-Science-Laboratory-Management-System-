import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notes - Get all notes (with optional practicalId filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practicalId = searchParams.get('practicalId');

    let where: any = {};

    if (practicalId) {
      where.practicalId = parseInt(practicalId);
    }

    // Fetch notes
    const notes = await prisma.note.findMany({
      where,
      include: {
        practical: {
          select: {
            id: true,
            title: true,
            subject: true,
            lab: true,
            dateTime: true,
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

