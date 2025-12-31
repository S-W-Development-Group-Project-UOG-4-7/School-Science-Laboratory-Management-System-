import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.practicalSchedule.update({
    where: { id: params.id },
    data: {
      title: body.title,
      subject: body.subject,
      grade: body.grade,
      date: new Date(body.date),
      time: body.time,
      duration: body.duration,
      teacher: body.teacher,
      location: body.location,
      notes: body.notes,
      maxStudents: Number(body.maxStudents),
      status: body.status,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.practicalSchedule.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Schedule deleted' });
}
