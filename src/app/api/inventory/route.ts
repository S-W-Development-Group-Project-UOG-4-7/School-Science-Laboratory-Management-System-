import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
   const items = await prisma.inventory.findMany({
    orderBy: { lastUpdated: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const item = await prisma.inventory.create({
      data: {
        
        name: data.name,
        category: data.category, // REQUIRED
        stockLevel: Number(data.stockLevel),
        minStockLevel: Number(data.minStockLevel),
        unit: data.unit,
        location: data.location,
        photo: data.photo || null,
        storageInstructions: data.storageInstructions || null,
        handlingProcedure: data.handlingProcedure || null,
        safetyNotes: data.safetyNotes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const data = await req.json();

  const item = await prisma.inventory.update({
    where: { id: Number(data.id) },
    data: {
      name: data.name,
      category: data.category,
      stockLevel: Number(data.stockLevel),
      minStockLevel: Number(data.minStockLevel),
      unit: data.unit,
      location: data.location,
      storageInstructions: data.storageInstructions || null,
      handlingProcedure: data.handlingProcedure || null,
      safetyNotes: data.safetyNotes || null,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.inventory.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
