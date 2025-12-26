import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/attendance - Mark student attendance for a practical
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, practicalId, status } = body;

    // Validation
    if (!studentId || !practicalId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: studentId and practicalId are required',
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

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_practicalId: {
          studentId: parseInt(studentId),
          practicalId: parseInt(practicalId),
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          message: 'Attendance already recorded for this student and practical session',
        },
        { status: 409 }
      );
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: parseInt(studentId),
        practicalId: parseInt(practicalId),
        status: status || 'PRESENT',
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
        message: 'Attendance recorded successfully',
        data: attendance,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to record attendance',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/attendance - Get attendance records (with optional studentId filter)
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

    // Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
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
        message: 'Attendance records retrieved successfully',
        data: attendanceRecords,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch attendance records',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

