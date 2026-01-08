import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET schedule by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: Number(params.id) },
    include: {
      teacher: { include: { user: true } },
    },
  });
  return NextResponse.json(schedule);
}

// UPDATE schedule by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  const schedule = await prisma.schedule.update({
    where: { id: Number(params.id) },
    data,
  });

  return NextResponse.json(schedule);
}

// DELETE schedule by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.schedule.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ success: true });
}
