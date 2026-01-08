// app/api/schedules/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ScheduleStatus } from '@prisma/client';

// --------------------
// Helper: Transform database schedule to frontend format
// --------------------
const transformScheduleForFrontend = (schedule: any) => {
  // Handle missing fields gracefully
  const studentRequirements = schedule.studentRequirements || '';
  const daySchedule = schedule.daySchedule || '';
  
  return {
    // Core fields that match frontend
    id: schedule.id.toString(),
    title: schedule.title,
    date: schedule.date.toISOString().split('T')[0], // Format: YYYY-MM-DD
    time: schedule.time,
    duration: schedule.duration,
    grade: schedule.grade,
    className: schedule.classSection, // Map classSection to className for frontend
    fullClassName: `${schedule.grade} - ${schedule.classSection}`,
    subject: schedule.subject as 'Physics' | 'Chemistry' | 'Biology' | 'Science',
    teacher: schedule.teacher?.user?.name || 'Unknown Teacher',
    location: schedule.location,
    notes: schedule.notes || '',
    
    // These fields will be empty until migration is complete
    studentRequirements: studentRequirements,
    daySchedule: daySchedule,
    
    maxStudents: schedule.maxStudents,
    status: schedule.status.toLowerCase() as 'upcoming' | 'completed' | 'cancelled',
    
    // Additional fields from your frontend interface
    attachments: schedule.attachments?.map((att: any) => att.fileName) || [],
    
    // Backend-only fields (for internal use)
    teacherId: schedule.teacherId,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  };
};

// --------------------
// Conflict checker
// --------------------
async function checkScheduleConflicts(
  date: Date,
  time: string,
  location: string,
  teacherId: number,
  grade: string,
  classSection: string,
  excludeScheduleId?: number
) {
  const where: any = {
    date,
    time,
    status: { not: 'CANCELLED' },
    ...(excludeScheduleId && { id: { not: excludeScheduleId } }),
  };

  // Check for any of these conflicts
  where.OR = [
    { location },                     // Same location
    { teacherId },                    // Same teacher
    {
      AND: [{ grade }, { classSection }], // Same class
    },
  ];

  return prisma.schedule.findMany({
    where,
    include: {
      teacher: { include: { user: true } },
      attachments: true,
    },
  });
}

// --------------------
// Transform frontend data to database format
// --------------------
const transformFrontendToDatabase = (data: any) => {
  const dbData: any = {
    title: data.title,
    date: new Date(data.date),
    time: data.time,
    duration: data.duration,
    grade: data.grade,
    classSection: data.classSection || data.className, // Handle both
    subject: data.subject,
    location: data.location,
    maxStudents: data.maxStudents,
    teacherId: data.teacherId,
    status: (data.status?.toUpperCase() || 'UPCOMING') as ScheduleStatus,
  };

  // Add optional fields if they exist
  if (data.notes !== undefined) dbData.notes = data.notes || null;
  if (data.studentRequirements !== undefined) dbData.studentRequirements = data.studentRequirements || null;
  if (data.daySchedule !== undefined) dbData.daySchedule = data.daySchedule || null;

  return dbData;
};

// --------------------
// GET schedules
// --------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const where: any = {};

    // Filter by teacher
    if (searchParams.get('teacherId')) {
      where.teacherId = parseInt(searchParams.get('teacherId')!);
    }

    // Filter by status
    if (searchParams.get('status')) {
      where.status = searchParams.get('status')!.toUpperCase() as ScheduleStatus;
    }

    // Filter by date range
    if (searchParams.get('startDate')) {
      where.date = {
        gte: new Date(searchParams.get('startDate')!),
      };
    }

    if (searchParams.get('endDate')) {
      where.date = {
        ...where.date,
        lte: new Date(searchParams.get('endDate')!),
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        teacher: { include: { user: true } },
        attachments: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    // Transform for frontend
    const formattedSchedules = schedules.map(transformScheduleForFrontend);
    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error('GET schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// --------------------
// POST create schedule
// --------------------
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Required fields matching frontend
    const requiredFields = [
      'title',
      'date',
      'time',
      'duration',
      'grade',
      'subject',
      'location',
      'maxStudents',
      'teacherId',
    ];

    // Validate required fields
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate classSection (className in frontend)
    if (!data.classSection && !data.className) {
      return NextResponse.json(
        { error: 'Class section is required' },
        { status: 400 }
      );
    }

    // Transform and prepare data
    const dbData = transformFrontendToDatabase(data);
    
    // Check for scheduling conflicts
    const conflicts = await checkScheduleConflicts(
      dbData.date,
      dbData.time,
      dbData.location,
      dbData.teacherId,
      dbData.grade,
      dbData.classSection
    );

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      return NextResponse.json(
        {
          error: 'Schedule conflict detected',
          conflictingSchedule: transformScheduleForFrontend(conflict),
          conflictType: conflict.location === dbData.location ? 'location' : 
                       conflict.teacherId === dbData.teacherId ? 'teacher' : 'class',
        },
        { status: 409 }
      );
    }

    // Create the schedule
    const schedule = await prisma.schedule.create({
      data: dbData,
      include: {
        teacher: { include: { user: true } },
        attachments: true,
      },
    });

    return NextResponse.json(
      transformScheduleForFrontend(schedule), 
      { status: 201 }
    );
  } catch (error) {
    console.error('POST schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// --------------------
// PUT update schedule
// --------------------
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: parseInt(data.id) },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.classSection !== undefined) updateData.classSection = data.classSection;
    if (data.className !== undefined) updateData.classSection = data.className; // Map className to classSection
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    
    // Add new fields if provided
    if (data.studentRequirements !== undefined) {
      updateData.studentRequirements = data.studentRequirements || null;
    }
    if (data.daySchedule !== undefined) {
      updateData.daySchedule = data.daySchedule || null;
    }
    
    if (data.maxStudents !== undefined) updateData.maxStudents = data.maxStudents;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;

    // Check for conflicts if time/location/class is changing
    if (data.date || data.time || data.location || data.grade || data.classSection || data.className) {
      const checkDate = data.date ? new Date(data.date) : existingSchedule.date;
      const checkTime = data.time || existingSchedule.time;
      const checkLocation = data.location || existingSchedule.location;
      const checkGrade = data.grade || existingSchedule.grade;
      const checkClassSection = data.classSection || data.className || existingSchedule.classSection;
      const checkTeacherId = data.teacherId || existingSchedule.teacherId;

      const conflicts = await checkScheduleConflicts(
        checkDate,
        checkTime,
        checkLocation,
        checkTeacherId,
        checkGrade,
        checkClassSection,
        parseInt(data.id)
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Schedule conflict detected',
            conflictingSchedule: transformScheduleForFrontend(conflicts[0]),
          },
          { status: 409 }
        );
      }
    }

    // Update the schedule
    const schedule = await prisma.schedule.update({
      where: { id: parseInt(data.id) },
      data: updateData,
      include: {
        teacher: { include: { user: true } },
        attachments: true,
      },
    });

    return NextResponse.json(transformScheduleForFrontend(schedule));
  } catch (error) {
    console.error('PUT schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// --------------------
// DELETE schedule
// --------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Delete the schedule (attachments will cascade)
    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Schedule deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('DELETE schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}