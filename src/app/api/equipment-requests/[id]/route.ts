import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH update equipment request status
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { status, responseNote } = body;

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'PREPARED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const equipmentRequest = await (prisma as any).equipmentRequest.update({
  where: { id: parseInt(id) },
  data: {
    status,
    responseNote,
    responseDate: new Date(),
  },
  include: {
    teacher: { include: { user: true } },
    labAssistant: { include: { user: true } },
    equipmentItems: true,
  },
});



    return NextResponse.json({ request: equipmentRequest });
  } catch (error) {
    console.error('Error updating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment request' },
      { status: 500 }
    );
  }
}