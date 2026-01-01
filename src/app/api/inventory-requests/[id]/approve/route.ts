import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = Number(params.id);

    // 1️⃣ Get request
    const request = await prisma.inventoryRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // 2️⃣ Update request status
    const updatedRequest = await prisma.inventoryRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',   // MUST match Prisma enum
        responseDate: new Date(),
      },
    });

    // 3️⃣ Reduce inventory stock
    await prisma.inventory.update({
      where: { id: request.itemId },
      data: {
        stockLevel: {
          decrement: request.quantity,
        },
      },
    });

    return NextResponse.json(updatedRequest, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}
