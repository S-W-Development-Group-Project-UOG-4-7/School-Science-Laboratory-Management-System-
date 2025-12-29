// src/app/api/inventory-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const requests = await prisma.inventoryRequest.findMany();
    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const created = await prisma.inventoryRequest.create({
      data: {
        requesterName: data.requesterName,
        requesterRole: data.requesterRole,
        requesterId: data.requesterId,
        itemId: data.itemId,
        quantity: data.quantity,
        reason: data.reason,
        urgency: data.urgency,
        status: data.status,
        requestDate: new Date(),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
