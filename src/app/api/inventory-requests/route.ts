// src/app/api/inventory-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const requests = await prisma.inventoryRequest.findMany();
    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Incoming request data:', data);

    const itemId = Number(data.itemId);
    const quantity = Number(data.quantity);
    const requesterId = Number(data.requesterId);

    // ✅ Validation
    if (!itemId || isNaN(itemId)) return NextResponse.json({ error: 'Invalid inventory item ID' }, { status: 400 });
    if (!quantity || isNaN(quantity)) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    if (!requesterId || isNaN(requesterId)) return NextResponse.json({ error: 'Invalid requester ID' }, { status: 400 });
    if (!data.requesterName) return NextResponse.json({ error: 'Missing requester name' }, { status: 400 });

    // ✅ Check inventory exists
    const inventoryItem = await prisma.inventory.findUnique({ where: { id: itemId } });
    if (!inventoryItem) return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });

    // ✅ Generate token
    const approvalToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // ✅ Create inventory request
    const created = await prisma.inventoryRequest.create({
      data: {
        requesterName: data.requesterName,
        requesterRole: data.requesterRole || 'LAB_ASSISTANT',
        requesterId: data.requesterId,
        itemId,
        quantity,
        reason: data.reason || 'No reason',
        urgency: data.urgency || 'NORMAL',
        status: data.status || 'PENDING',
        requestDate: new Date(),
        approvalToken,
        tokenExpiresAt,
      },
    });

    return NextResponse.json(created, { status: 201 });

  } catch (err: any) {
    console.error('Error creating inventory request:', err);
    return NextResponse.json({ error: 'Failed to create inventory request', details: err.message }, { status: 500 });
  }
}
