import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/equipment-requests/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);
    
    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id: requestId },
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

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: equipmentRequest });
  } catch (error) {
    console.error('Error fetching equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment request' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment-requests/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);
    const body = await request.json();

    const existingRequest = await prisma.equipmentRequest.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.status) updateData.status = body.status as RequestStatus;
    if (body.responseNote !== undefined) updateData.responseNote = body.responseNote;
    if (body.status && (body.status === 'APPROVED' || body.status === 'REJECTED')) {
      updateData.responseDate = new Date();
    }

    const updatedRequest = await prisma.equipmentRequest.update({
      where: { id: requestId },
      data: updateData,
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
      request: updatedRequest 
    });
  } catch (error: any) {
    console.error('Error updating equipment request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update equipment request' },
      { status: 500 }
    );
  }
}