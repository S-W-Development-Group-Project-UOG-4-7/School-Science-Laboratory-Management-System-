import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/lab-sheet-downloads - Get lab sheet download history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const practicalId = searchParams.get('practicalId');

    let where: any = {};

    if (studentId) {
      where.studentId = parseInt(studentId);
    }

    if (practicalId) {
      where.practicalId = parseInt(practicalId);
    }

    const downloads = await prisma.labSheetDownload.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        downloadedAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lab sheet downloads retrieved successfully',
        data: downloads,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching lab sheet downloads:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch lab sheet downloads',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

