import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ScheduleStatus } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const subject = searchParams.get('subject');

    let where: any = {};

    if (teacherId) where.teacherId = parseInt(teacherId);
    if (status) where.status = status as ScheduleStatus;
    if (subject) where.subject = subject;

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const schedules = await prisma.practicalSchedule.findMany({
      where,
      include: {
        attachments: true,
        equipmentRequests: {
          include: {
            equipmentItems: true,
            teacher: {
              include: {
                user: true
              }
            },
            labAssistant: {
              include: {
                user: true
              }
            }
          }
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST /api/schedules
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['title', 'date', 'period', 'grade', 'className', 'subject', 'teacherId', 'teacherName'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate date
    const scheduleDate = new Date(body.date);
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check for schedule conflicts (same teacher, same date and period)
    const existingSchedule = await prisma.practicalSchedule.findFirst({
      where: {
        teacherId: body.teacherId,
        date: scheduleDate,
        period: body.period,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'You already have a schedule at this time' },
        { status: 409 }
      );
    }

    const schedule = await prisma.practicalSchedule.create({
      data: {
        title: body.title,
        date: scheduleDate,
        period: body.period,
        grade: body.grade,
        className: body.className,
        fullClassName: body.fullClassName || `${body.grade} - ${body.className}`,
        subject: body.subject,
        teacherId: body.teacherId,
        teacherName: body.teacherName,
        location: body.location || 'Primary Lab',
        notes: body.notes || '',
        status: body.status || ScheduleStatus.UPCOMING,
      },
      include: {
        attachments: true,
        equipmentRequests: {
          include: {
            equipmentItems: true
          }
        }
      },
    });

    return NextResponse.json({ 
      success: true,
      schedule 
    });
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}