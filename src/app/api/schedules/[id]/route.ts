// app/api/schedules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ScheduleStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/schedules/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.practicalSchedule.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        attachments: true,
        equipmentRequests: {
          include: {
            equipmentItems: true,
            labAssistant: { include: { user: true } },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

// PUT /api/schedules/[id] - Full update
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const scheduleId = parseInt(params.id);

    const existingSchedule = await prisma.practicalSchedule.findUnique({ where: { id: scheduleId } });
    if (!existingSchedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

    const updatedSchedule = await prisma.practicalSchedule.update({
      where: { id: scheduleId },
      data: {
        title: body.title,
        date: new Date(`${body.date}T00:00:00`),
        period: body.period,
        grade: body.grade,
        className: body.className,
        fullClassName: body.fullClassName || `${body.grade} - ${body.className}`,
        subject: body.subject,
        location: body.location,
        notes: body.notes,
        status: body.status as ScheduleStatus,
      },
      include: { attachments: true },
    });

    return NextResponse.json({ schedule: updatedSchedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// PATCH /api/schedules/[id] - Partial update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const scheduleId = parseInt(params.id);

    const existingSchedule = await prisma.practicalSchedule.findUnique({ where: { id: scheduleId } });
    if (!existingSchedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

    const updateData: any = {};
    if (body.status) updateData.status = body.status as ScheduleStatus;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.location) updateData.location = body.location;

    const updatedSchedule = await prisma.practicalSchedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: { attachments: true },
    });

    return NextResponse.json({ schedule: updatedSchedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE /api/schedules/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = parseInt(params.id);

    const existingSchedule = await prisma.practicalSchedule.findUnique({ where: { id: scheduleId } });
    if (!existingSchedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

    await prisma.practicalSchedule.delete({ where: { id: scheduleId } });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
