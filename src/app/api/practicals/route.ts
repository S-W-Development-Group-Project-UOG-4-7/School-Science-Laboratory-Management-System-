import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DifficultyLevel } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    console.log('=== PRACTICALS API CALLED ===');
    const searchParams = request.nextUrl.searchParams;
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const difficulty = searchParams.get('difficulty');
    const teacherId = searchParams.get('teacherId');

    // Build where clause - simplified approach
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (subject && subject !== 'all') where.subject = subject;
    if (grade && grade !== 'all') where.grade = grade;
    
    if (difficulty) {
      // Convert UI difficulty to enum value
      const difficultyMap: Record<string, DifficultyLevel> = {
        'beginner': DifficultyLevel.BEGINNER,
        'intermediate': DifficultyLevel.INTERMEDIATE,
        'advanced': DifficultyLevel.ADVANCED
      };
      where.difficulty = difficultyMap[difficulty.toLowerCase()] || difficulty;
    }
    
    if (teacherId) where.teacherId = parseInt(teacherId);

    console.log('Where clause:', where);

    const practicals = await prisma.practical.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        quizzes: {
          include: {
            questions: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${practicals.length} practicals`);
    
    // Transform the data to match your frontend types
    const transformedPracticals = practicals.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      subject: p.subject,
      grade: p.grade,
      duration: p.duration,
      difficulty: p.difficulty as DifficultyLevel,
      videoUrl: p.videoUrl,
      labSheetUrl: p.labSheetUrl,
      thumbnail: p.thumbnail,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      teacherId: p.teacherId,
      teacher: p.teacher ? {
        id: p.teacher.id,
        userId: p.teacher.userId,
        subject: p.teacher.subject,
        user: p.teacher.user
      } : null,
      quizzes: p.quizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        practicalId: q.practicalId,
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        timeLimit: q.timeLimit,
        status: q.status,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        teacherId: q.teacherId,
        questions: q.questions.map(question => ({
          id: question.id,
          quizId: question.quizId,
          question: question.question,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          correctAnswers: question.correctAnswers,
          marks: question.marks,
          explanation: question.explanation,
          order: question.order,
          createdAt: question.createdAt
        }))
      }))
    }));

    return NextResponse.json(transformedPracticals);
  } catch (error) {
    console.error('Error fetching practicals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch practicals',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating practical with data:', body);
    
    // Validate required fields
    const requiredFields = ['title', 'subject', 'grade', 'teacherId'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const teacherExists = await prisma.teacher.findUnique({
      where: { id: body.teacherId }
    });

    if (!teacherExists) {
      return NextResponse.json(
        { 
          error: `Teacher with ID ${body.teacherId} not found. Please provide a valid teacher ID.`
        },
        { status: 404 }
      );
    }

    // Create the practical
    const practical = await prisma.practical.create({
      data: {
        title: body.title,
        description: body.description || null,
        subject: body.subject,
        grade: body.grade,
        duration: body.duration || '45 min',
        difficulty: body.difficulty || DifficultyLevel.INTERMEDIATE,
        videoUrl: body.videoUrl || null,
        labSheetUrl: body.labSheetUrl || null,
        thumbnail: body.thumbnail || null,
        teacherId: body.teacherId
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        quizzes: true
      }
    });

    console.log('Created practical:', practical);
    
    // Transform the response
    const transformedPractical = {
      id: practical.id,
      title: practical.title,
      description: practical.description,
      subject: practical.subject,
      grade: practical.grade,
      duration: practical.duration,
      difficulty: practical.difficulty as DifficultyLevel,
      videoUrl: practical.videoUrl,
      labSheetUrl: practical.labSheetUrl,
      thumbnail: practical.thumbnail,
      createdAt: practical.createdAt,
      updatedAt: practical.updatedAt,
      teacherId: practical.teacherId,
      teacher: practical.teacher ? {
        id: practical.teacher.id,
        userId: practical.teacher.userId,
        subject: practical.teacher.subject,
        user: practical.teacher.user
      } : null,
      quizzes: practical.quizzes || []
    };

    return NextResponse.json(transformedPractical, { status: 201 });
  } catch (error) {
    console.error('Error creating practical:', error);
    
    // Handle specific Prisma errors
    let errorMessage = 'Failed to create practical';
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Foreign key constraint error
      if (error.message.includes('Foreign key constraint') || 
          error.message.includes('teacherId')) {
        errorMessage = 'Teacher not found. Please provide a valid teacher ID.';
        statusCode = 404;
      }
      // Unique constraint error
      else if (error.message.includes('Unique constraint')) {
        errorMessage = 'A practical with similar details already exists.';
        statusCode = 409;
      }
      // Validation error
      else if (error.message.includes('Argument') || 
               error.message.includes('Invalid value')) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : undefined 
          : undefined
      },
      { status: statusCode }
    );
  }
}