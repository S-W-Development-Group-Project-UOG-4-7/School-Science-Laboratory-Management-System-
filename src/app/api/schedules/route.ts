import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ScheduleStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


const prisma = new PrismaClient();

// POST /api/practical-schedules
export async function POST(request: NextRequest) {
  try {
    // Get session from next-auth
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if user is a teacher
    if (session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create schedules' },
        { status: 403 }
      );
    }

    // Get teacher record for this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // ✅ Validate required fields
    const requiredFields = ['title', 'date', 'period', 'grade', 'className', 'subject'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // ✅ Validate date
    const scheduleDate = new Date(body.date);
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // ❌ Prevent conflicts
    const conflict = await prisma.practicalSchedule.findFirst({
      where: {
        teacherId: teacher.id,
        date: scheduleDate,
        period: body.period,
        status: { not: 'CANCELLED' }
      }
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'You already have a schedule at this time' },
        { status: 409 }
      );
    }

    // ✅ Create schedule using the teacher's ID
    const schedule = await prisma.practicalSchedule.create({
      data: {
        title: body.title,
        date: scheduleDate,
        period: body.period,
        grade: body.grade,
        className: body.className,
        fullClassName: body.fullClassName || `${body.grade} - ${body.className}`,
        subject: body.subject,
        teacherId: teacher.id, // Use the teacher's ID from database
        location: body.location || 'Primary Lab',
        notes: body.notes || '',
        status: body.status || ScheduleStatus.UPCOMING,
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      schedule 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// GET /api/practical-schedules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let schedules;
    
    if (session.user.role === 'teacher') {
      // Get teacher record for this user
      const teacher = await prisma.teacher.findUnique({
        where: { userId: parseInt(session.user.id) },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: 'Teacher profile not found' },
          { status: 404 }
        );
      }

      // Get schedules for this teacher
      schedules = await prisma.practicalSchedule.findMany({
        where: {
          teacherId: teacher.id
        },
        include: {
          teacher: {
            include: {
              user: true
            }
          },
          attachments: true,
          equipmentRequests: {
            include: {
              equipmentItems: true,
              labAssistant: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
    } else {
      // For non-teachers (admin, lab assistant), get all schedules
      schedules = await prisma.practicalSchedule.findMany({
        include: {
          teacher: {
            include: {
              user: true
            }
          },
          attachments: true,
          equipmentRequests: {
            include: {
              equipmentItems: true,
              labAssistant: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
    }

    return NextResponse.json({
      success: true,
      schedules
    });

  } catch (error: any) {
    console.error('Error fetching practical schedules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}