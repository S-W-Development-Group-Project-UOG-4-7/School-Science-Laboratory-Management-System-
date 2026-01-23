// src/app/api/inventory-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();export async function PUT(req: NextRequest, { params }: { params?: { id: string } }) {
  try {
    const data = await req.json();
    const requestId = data.id;

    const updated = await prisma.inventoryRequest.update({
      where: { id: requestId },
      data: {
        itemId: Number(data.itemId),
        quantity: data.quantity,
        reason: data.reason,
        urgency: data.urgency,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: { params?: { id: string } }) {
  try {
    const { id } = await req.json();
    await prisma.inventoryRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}

