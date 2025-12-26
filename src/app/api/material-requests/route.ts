import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/material-requests - Create a new material request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, practicalId, itemName, quantity } = body;

    // Validation
    if (!studentId || !practicalId || !itemName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: studentId, practicalId, and itemName are required',
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

    // Create material request
    const materialRequest = await prisma.materialRequest.create({
      data: {
        studentId: parseInt(studentId),
        practicalId: parseInt(practicalId),
        itemName,
        quantity: quantity ? parseInt(quantity) : 1,
        status: 'PENDING',
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
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Material request created successfully',
        data: materialRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating material request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create material request',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/material-requests - Get material requests (with optional studentId filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    let where: any = {};

    if (studentId) {
      where.studentId = parseInt(studentId);
    }

    const materialRequests = await prisma.materialRequest.findMany({
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
        message: 'Material requests retrieved successfully',
        data: materialRequests,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching material requests:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch material requests',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

