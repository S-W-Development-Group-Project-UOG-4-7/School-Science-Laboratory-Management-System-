import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/equipment-requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const labAssistantId = searchParams.get('labAssistantId');
    const status = searchParams.get('status');

    let where: any = {};

    if (teacherId) where.teacherId = parseInt(teacherId);
    if (labAssistantId) where.labAssistantId = parseInt(labAssistantId);
    if (status) where.status = status as RequestStatus;

    const requests = await prisma.equipmentRequest.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        labAssistant: {
          include: {
            user: true
          }
        },
        equipmentItems: true,
        practicalSchedule: true
      },
      orderBy: { createdAt: 'desc' },
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

// POST /api/equipment-requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'teacherId',
      'labAssistantId',
      'className',
      'grade',
      'subject',
      'practicalDate',
      'practicalTime',
      'equipmentItems'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate equipment items
    if (!Array.isArray(body.equipmentItems) || body.equipmentItems.length === 0) {
      return NextResponse.json(
        { error: 'Equipment items must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create the equipment request
    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        teacherId: body.teacherId,
        labAssistantId: body.labAssistantId,
        practicalScheduleId: body.practicalScheduleId,
        className: body.className,
        grade: body.grade,
        subject: body.subject,
        practicalDate: new Date(body.practicalDate),
        practicalTime: body.practicalTime,
        additionalNotes: body.additionalNotes || '',
        status: body.status || RequestStatus.PENDING,
        equipmentItems: {
          create: body.equipmentItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category
          }))
        }
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        labAssistant: {
          include: {
            user: true
          }
        },
        equipmentItems: true,
        practicalSchedule: true
      }
    });

    return NextResponse.json({ 
      success: true,
      request: equipmentRequest 
    });
  } catch (error: any) {
    console.error('Error creating equipment request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}