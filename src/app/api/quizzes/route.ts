
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practicalId = searchParams.get('practicalId');

    const where: any = {};
    if (practicalId) {
      where.practicalId = parseInt(practicalId);
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        practical: true,
        teacher: {
          include: {
            user: true
          }
        },
        questions: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format for frontend
    const formattedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      isPublished: quiz.status === 'PUBLISHED'
    }));

    return NextResponse.json(formattedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'practicalId', 'teacherId'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        description: body.description || null,
        practicalId: body.practicalId,
        teacherId: body.teacherId,
        totalMarks: body.totalMarks || 100,
        passingMarks: body.passingMarks || 60,
        timeLimit: body.timeLimit || null,
        status: body.status || 'DRAFT'
      },
      include: {
        practical: true,
        teacher: {
          include: {
            user: true
          }
        },
        questions: true
      }
    });

    // Format response
    const formattedQuiz = {
      ...quiz,
      isPublished: quiz.status === 'PUBLISHED'
    };

    return NextResponse.json(formattedQuiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}