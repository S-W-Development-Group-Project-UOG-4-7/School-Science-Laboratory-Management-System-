import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET all equipment requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const status = searchParams.get('status');

    let where: any = {};

    // Filter by user role
    if (userId && userRole) {
      const userIdNum = parseInt(userId);
      
      if (userRole === 'TEACHER') {
        // First find the teacher by userId
        const teacher = await prisma.teacher.findUnique({
          where: { userId: userIdNum }
        });
        
        if (teacher) {
          where.teacherId = teacher.id;
        } else {
          return NextResponse.json({ requests: [] });
        }
      } else if (userRole === 'LAB_ASSISTANT') {
        // First find the lab assistant by userId
        const labAssistant = await prisma.labAssistant.findUnique({
          where: { userId: userIdNum }
        });
        
        if (labAssistant) {
          where.labAssistantId = labAssistant.id;
        } else {
          return NextResponse.json({ requests: [] });
        }
      }
    }

    // Filter by status
    if (status && status !== 'all' && Object.values(RequestStatus).includes(status as RequestStatus)) {
      where.status = status as RequestStatus;
    }

    const requests = await prisma.equipmentRequest.findMany({
      where,
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
        equipmentItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}

// POST create new equipment request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teacherId,
      labAssistantId,
      className,
      grade,
      subject,
      practicalDate,
      practicalTime,
      additionalNotes,
      equipmentItems,
    } = body;

    // First find the teacher by userId
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Create the request
    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        teacherId: teacher.id,
        labAssistantId,
        className,
        grade,
        subject,
        practicalDate: new Date(practicalDate),
        practicalTime,
        additionalNotes,
        status: 'PENDING',
        equipmentItems: {
          create: equipmentItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
          })),
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
        equipmentItems: true,
      },
    });

    return NextResponse.json({ request: equipmentRequest });
  } catch (error) {
    console.error('Error creating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}