import { NextResponse } from 'next/server';
import { PrismaClient , Category } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    return NextResponse.json({ inventoryItems: items });
  } catch (error) {
    console.error('GET inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST: Create new inventory item (with image upload)
===================================================== */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    /* ---------- Image handling ---------- */
    const photo = formData.get('photo') as File | null;
    let photoUrl: string | null = null;

    if (photo) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const fileName = `${Date.now()}-${photo.name}`;
      const uploadPath = path.join(uploadDir, fileName);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(uploadPath, buffer);

      photoUrl = `/uploads/${fileName}`;
    }

    /* ---------- Database insert ---------- */
    const item = await prisma.inventory.create({
      data: {
        name: formData.get('name') as string,
        category: formData.get('category') as Category,

       quantity: Number(formData.get('quantity')),
        unit: formData.get('unit') as string,

        packageSize: formData.get('packageSize')
          ? Number(formData.get('packageSize'))
          : null,

        packageUnit: formData.get('packageUnit')
          ? (formData.get('packageUnit') as string)
          : null,

        minStockLevel: Number(formData.get('minStockLevel')),
        location: formData.get('location') as string,

        photo: photoUrl,

        storageInstructions:
          (formData.get('storageInstructions') as string) || null,
        handlingProcedure:
          (formData.get('handlingProcedure') as string) || null,
        safetyNotes:
          (formData.get('safetyNotes') as string) || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

/* =====================================================
   PUT: Update inventory item
===================================================== */
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const item = await prisma.inventory.update({
      where: {
        id: Number(data.id),
      },
      data: {
        name: data.name,
        category: data.category,

        quantity: Number(data.quantity),
        unit: data.unit,

        packageSize: data.packageSize ?? null,
        packageUnit: data.packageUnit || null,

        minStockLevel: Number(data.minStockLevel),
        location: data.location,

        storageInstructions: data.storageInstructions || null,
        handlingProcedure: data.handlingProcedure || null,
        safetyNotes: data.safetyNotes || null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}


/* =====================================================
   DELETE: Delete inventory item
===================================================== */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.inventory.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
