import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const requests = await prisma.inventoryRequest.findMany({
    include: { item: true },
  });
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newRequest = await prisma.inventoryRequest.create({
    data: {
      requesterName: body.requesterName,
      requesterRole: body.requesterRole,
      requesterId: body.requesterId,
      itemId: body.itemId,
      quantity: body.quantity,
      reason: body.reason,
      urgency: body.urgency,
    },
  });
  return NextResponse.json(newRequest);
}
