import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RequestStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Check if user is a teacher
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create equipment requests' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = ['labAssistantId', 'practicalScheduleId', 'className', 'grade', 'subject', 'practicalDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create equipment request
    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        teacherId: teacher.id, // Use the teacher's ID from database
        labAssistantId: parseInt(body.labAssistantId),
        practicalScheduleId: body.practicalScheduleId,
        className: body.className,
        grade: body.grade,
        subject: body.subject,
        practicalDate: new Date(body.practicalDate),
        practicalTime: body.practicalTime || '',
        additionalNotes: body.additionalNotes || '',
        status: RequestStatus.PENDING,
        equipmentItems: {
          create: body.equipmentItems?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
          })) || [],
        },
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        labAssistant: {
          include: {
            user: true,
          },
        },
        practicalSchedule: true,
        equipmentItems: true,
      },
    });

    return NextResponse.json(
      { success: true, request: equipmentRequest },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create equipment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}