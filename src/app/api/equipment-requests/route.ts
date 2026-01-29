// src/app/api/equipment-requests/route.ts
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RequestStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies, headers } from 'next/headers';

const prisma = new PrismaClient();

// ----------------------------
// Helper: Get authenticated user
// ----------------------------
async function getAuthenticatedUser() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: Number(session.user.id) },
        include: {
          teacher: true,
          labAssistant: true,
        },
      });
      
      if (user) {
        return user;
      }
    }

    // Fallback: cookies/headers
    const cookieStore = await cookies();
    const headersList = await headers();

    const userId = cookieStore.get('userId')?.value || headersList.get('x-user-id');

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: {
          teacher: true,
          labAssistant: true,
        },
      });
      
      if (user) {
        return user;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error);
    return null;
  }
}

// ----------------------------
// POST: Create equipment request
// ----------------------------
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'TEACHER' || !user.teacher) {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can create equipment requests.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['className', 'grade', 'subject', 'practicalDate', 'practicalTime', 'equipmentItems'];
    const missing = requiredFields.filter(f => !body[f]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Validate equipment items array
    if (!Array.isArray(body.equipmentItems) || body.equipmentItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one equipment item is required' }, 
        { status: 400 }
      );
    }

    // Validate lab assistant if provided
    if (body.labAssistantId) {
      const labAssistant = await prisma.labAssistant.findUnique({
        where: { id: Number(body.labAssistantId) }
      });
      
      if (!labAssistant) {
        return NextResponse.json(
          { error: 'Selected lab assistant not found' }, 
          { status: 404 }
        );
      }
    }

    // Create the equipment request
    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        teacherId: user.teacher.id,
        labAssistantId: body.labAssistantId ? Number(body.labAssistantId) : null,
        practicalScheduleId: body.practicalScheduleId ? Number(body.practicalScheduleId) : null,
        className: body.className,
        grade: body.grade,
        subject: body.subject,
        practicalDate: new Date(body.practicalDate),
        practicalTime: body.practicalTime,
        additionalNotes: body.additionalNotes || '',
        status: RequestStatus.PENDING,
        equipmentItems: {
          create: body.equipmentItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
          })),
        },
      },
      include: {
        equipmentItems: true,
        teacher: {
          include: { user: true }
        },
        labAssistant: {
          include: { user: true }
        },
        practicalSchedule: true,
      },
    });

    return NextResponse.json({
      success: true,
      request: equipmentRequest,
      message: 'Equipment request created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST equipment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create equipment request' }, 
      { status: 500 }
    );
  }
}

// ----------------------------
// GET: Fetch equipment requests
// ----------------------------
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const labAssistantId = searchParams.get('labAssistantId');
    const status = searchParams.get('status');

    // Build where clause based on user role and filters
    const where: any = {};

    if (user.role === 'TEACHER' && user.teacher) {
      // Teachers can only see their own requests
      where.teacherId = user.teacher.id;
    } else if (user.role === 'LAB_ASSISTANT' && user.labAssistant) {
      // Lab assistants see requests assigned to them
      where.labAssistantId = user.labAssistant.id;
    } else if (user.role === 'ADMIN' || user.role === 'PRINCIPAL') {
      // Admins and principals can see all, optionally filtered
      if (teacherId) where.teacherId = Number(teacherId);
      if (labAssistantId) where.labAssistantId = Number(labAssistantId);
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 403 }
      );
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    const requests = await prisma.equipmentRequest.findMany({
      where,
      include: {
        equipmentItems: true,
        teacher: {
          include: { user: true }
        },
        labAssistant: {
          include: { user: true }
        },
        practicalSchedule: true,
      },
      orderBy: { practicalDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length
    });

  } catch (error: any) {
    console.error('GET equipment requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch equipment requests' }, 
      { status: 500 }
    );
  }
}

// ----------------------------
// PATCH: Update equipment request status (for lab assistants)
// ----------------------------
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'LAB_ASSISTANT' || !user.labAssistant) {
      return NextResponse.json(
        { error: 'Unauthorized. Only lab assistants can update request status.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, responseNote } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' }, 
        { status: 400 }
      );
    }

    // Verify the request is assigned to this lab assistant
    const existing = await prisma.equipmentRequest.findFirst({
      where: {
        id: Number(id),
        labAssistantId: user.labAssistant.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Request not found or not assigned to you' }, 
        { status: 404 }
      );
    }

    // Update the request
    const updated = await prisma.equipmentRequest.update({
      where: { id: Number(id) },
      data: {
        status,
        responseNote: responseNote || null,
        responseDate: new Date(),
      },
      include: {
        equipmentItems: true,
        teacher: {
          include: { user: true }
        },
        labAssistant: {
          include: { user: true }
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: updated,
      message: `Request ${status.toLowerCase()}`
    });

  } catch (error: any) {
    console.error('PATCH equipment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update request' }, 
      { status: 500 }
    );
  }
}

// ----------------------------
// DELETE: Delete equipment request (for teachers)
// ----------------------------
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'TEACHER' || !user.teacher) {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can delete their requests.' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' }, 
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.equipmentRequest.findFirst({
      where: {
        id: Number(id),
        teacherId: user.teacher.id
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Request not found or you do not have permission to delete it' }, 
        { status: 404 }
      );
    }

    // Only allow deletion of pending requests
    if (existing.status !== RequestStatus.PENDING) {
      return NextResponse.json(
        { error: 'Can only delete pending requests' }, 
        { status: 409 }
      );
    }

    // Delete the request (cascade will delete equipment items)
    await prisma.equipmentRequest.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Equipment request deleted successfully'
    });

  } catch (error: any) {
    console.error('DELETE equipment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete request' }, 
      { status: 500 }
    );
  }
}