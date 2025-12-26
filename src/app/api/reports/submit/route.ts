import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reports/submit - Submit a practical report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, practicalId, fileUrl } = body;

    // Validation
    if (!studentId || !practicalId || !fileUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: studentId, practicalId, and fileUrl are required',
        },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found or invalid student ID',
        },
        { status: 404 }
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

    // Check if report already exists for this student and practical
    const existingReport = await prisma.reportSubmission.findUnique({
      where: {
        studentId_practicalId: {
          studentId: parseInt(studentId),
          practicalId: parseInt(practicalId),
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          message: 'Report already submitted for this practical session. You cannot submit multiple reports.',
        },
        { status: 409 }
      );
    }

    // Create report submission
    const reportSubmission = await prisma.reportSubmission.create({
      data: {
        studentId: parseInt(studentId),
        practicalId: parseInt(practicalId),
        fileUrl,
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
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Report submitted successfully',
        data: reportSubmission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit report',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

