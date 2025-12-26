import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports - Get submitted reports (with optional studentId filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    // Validation
    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameter: studentId',
        },
        { status: 400 }
      );
    }

    // Fetch reports for the student
    const reports = await prisma.reportSubmission.findMany({
      where: {
        studentId: parseInt(studentId),
      },
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
        message: 'Reports retrieved successfully',
        data: reports,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reports',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

