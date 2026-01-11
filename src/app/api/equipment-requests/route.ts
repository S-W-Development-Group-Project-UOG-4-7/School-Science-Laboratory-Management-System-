// src/app/api/equipment-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get('userRole');
    const userId = searchParams.get('userId');

    let whereClause = {};

    if (userRole === 'TEACHER') {
      whereClause = { teacherId: Number(userId) };
    } else if (userRole === 'LAB_ASSISTANT') {
      whereClause = { labAssistantId: Number(userId) };
    }

    const requests = await prisma.equipmentRequest.findMany({
      where: whereClause,
      include: {
        teacher: { include: { user: true } },
        labAssistant: { include: { user: true } },
        equipmentItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherId, labAssistantId, className, grade, subject, practicalDate, practicalTime, additionalNotes, equipmentItems } = body;

    const request = await prisma.equipmentRequest.create({
      data: {
        teacherId,
        labAssistantId,
        className,
        grade,
        subject,
        practicalDate: new Date(practicalDate),
        practicalTime,
        additionalNotes,
        status: 'PENDING',
        equipmentItems: { create: equipmentItems },
      },
      include: {
        teacher: { include: { user: true } },
        labAssistant: { include: { user: true } },
        equipmentItems: true,
      },
    });

    return NextResponse.json({ request });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
