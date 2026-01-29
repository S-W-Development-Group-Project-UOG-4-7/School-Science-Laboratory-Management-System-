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
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const itemId = Number(data.itemId);
        // ✅ VALIDATION
    if (!itemId || isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      );
    }
     // ✅ CHECK IF INVENTORY ITEM EXISTS
     const inventoryItem = await prisma.inventory.findUnique({
      where: { id: itemId },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
   
    // ✅ GENERATE APPROVAL TOKEN
       const approvalToken = crypto.randomUUID();
       const tokenExpiresAt = new Date(
       Date.now() + 24 * 60 * 60 * 1000 // 24 hours
       );
    const created = await prisma.inventoryRequest.create({
      data: {
        requesterName: data.requesterName,
        requesterRole: 'LAB_ASSISTANT',
        requesterId: data.requesterId,
        itemId: itemId,
        quantity: data.quantity,
        reason: data.reason,
        urgency: data.urgency,
        status: data.status,
        requestDate: new Date(),

        approvalToken,
        tokenExpiresAt,
      },
    });
        
    
    return NextResponse.json(created, { status: 201 });
  }  
  catch (err) {
  console.error("Error in POST /inventory-requests:", err);
  return NextResponse.json({ error: 'Failed to create request', details: err instanceof Error ? err.message : err }, { status: 500 }); 
 }
}