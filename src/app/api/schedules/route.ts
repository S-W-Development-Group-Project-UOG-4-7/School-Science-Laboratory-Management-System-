import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ScheduleStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('📨 POST /api/schedules - Start');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session found');
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    console.log('👤 Session user:', {
      id: session.user.id,
      role: session.user.role,
      teacherId: session.user.teacherId
    });
    
    // Check if user is a teacher
    if (session.user.role !== 'TEACHER' && session.user.role !== 'teacher') {
      console.log('❌ User is not a teacher:', session.user.role);
      return NextResponse.json({ 
        success: false,
        error: 'Only teachers can schedule practicals' 
      }, { status: 403 });
    }
    
    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: Number(session.user.id) }
    });
    
    if (!teacher) {
      console.log('❌ No teacher record found for user:', session.user.id);
      return NextResponse.json({ 
        success: false,
        error: 'Teacher profile not found. Please contact administrator.' 
      }, { status: 404 });
    }
    
    console.log('✅ Teacher found:', { id: teacher.id, userId: teacher.userId });
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // Validate required fields
    const requiredFields = ['title', 'date', 'period', 'grade', 'className', 'subject'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Validate date
    const scheduleDate = new Date(body.date);
    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid date format' 
      }, { status: 400 });
    }
    
    // Check for existing schedule at same time
    const existingSchedule = await prisma.practicalSchedule.findFirst({
      where: {
        teacherId: teacher.id,
        date: scheduleDate,
        period: body.period,
        status: ScheduleStatus.UPCOMING
      }
    });
    
    if (existingSchedule) {
      return NextResponse.json({ 
        success: false,
        error: `You already have a scheduled practical at period ${body.period} on ${body.date}` 
      }, { status: 409 });
    }
    
    // Create the schedule
    const schedule = await prisma.practicalSchedule.create({
      data: {
        title: body.title,
        date: scheduleDate,
        period: body.period,
        grade: body.grade,
        className: body.className,
        fullClassName: `${body.grade} - ${body.className}`,
        subject: body.subject,
        teacherId: teacher.id,
        location: body.location || 'Primary Lab',
        notes: body.notes || '',
        status: ScheduleStatus.UPCOMING,
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log('✅ Schedule created successfully:', schedule.id);
    
    return NextResponse.json({ 
      success: true, 
      schedule,
      message: 'Practical scheduled successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Error in POST /api/schedules:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'A schedule with similar details already exists' 
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid teacher or user reference' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    // Build where clause
    const where: any = {};
    
    // If teacherId is provided and user is admin, use it
    if (teacherId && (session.user.role === 'ADMIN' || session.user.role === 'admin')) {
      where.teacherId = parseInt(teacherId);
    } else if (session.user.role === 'TEACHER' || session.user.role === 'teacher') {
      // Get teacher's ID
      const teacher = await prisma.teacher.findUnique({
        where: { userId: Number(session.user.id) }
      });
      
      if (teacher) {
        where.teacherId = teacher.id;
      } else {
        return NextResponse.json({ 
          success: false,
          error: 'Teacher profile not found' 
        }, { status: 404 });
      }
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized access' 
      }, { status: 403 });
    }
    
    // Get schedules
    const schedules = await prisma.practicalSchedule.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: true
          }
        },
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
      orderBy: { date: 'asc' },
    });
    
    return NextResponse.json({ 
      success: true, 
      schedules,
      count: schedules.length
    });
    
  } catch (error: any) {
    console.error('Error in GET /api/schedules:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch schedules' 
    }, { status: 500 });
  }
}