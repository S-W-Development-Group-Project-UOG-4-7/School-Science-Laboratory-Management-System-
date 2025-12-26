import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quizzes - Get quizzes (with optional practicalId filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practicalId = searchParams.get('practicalId');

    let where: any = {};

    if (practicalId) {
      where.practicalId = parseInt(practicalId);
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        practical: {
          select: {
            id: true,
            title: true,
            subject: true,
            lab: true,
            dateTime: true,
          },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
            // Don't include correctAnswer in the response for security
          },
        },
        _count: {
          select: {
            quizAttempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quizzes retrieved successfully',
        data: quizzes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch quizzes',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

