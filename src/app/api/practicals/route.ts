import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const schedules = await prisma.practicalSchedule.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const body = await req.json();
  const schedule = await prisma.practicalSchedule.create({
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
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}
