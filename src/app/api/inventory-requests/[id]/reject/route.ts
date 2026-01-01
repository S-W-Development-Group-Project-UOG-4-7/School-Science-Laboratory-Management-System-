import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = Number(params.id);

    const updatedRequest = await prisma.inventoryRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        responseDate: new Date(),
      },
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}
