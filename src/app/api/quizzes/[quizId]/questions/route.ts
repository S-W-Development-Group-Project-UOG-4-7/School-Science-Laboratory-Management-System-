import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quizzes/[quizId]/questions - Get questions for a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    // Validation
    if (!quizId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameter: quizId',
        },
        { status: 400 }
      );
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: {
        practical: {
          select: {
            id: true,
            title: true,
            subject: true,
            lab: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quiz not found',
        },
        { status: 404 }
      );
    }

    // Fetch questions for the quiz (without correctAnswer for security)
    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizId: parseInt(quizId),
      },
      select: {
        id: true,
        questionText: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        marks: true,
        createdAt: true,
        // Don't include correctAnswer in the response for security
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quiz questions retrieved successfully',
        data: {
          quiz: {
            id: quiz.id,
            title: quiz.title,
            totalMarks: quiz.totalMarks,
            practical: quiz.practical,
          },
          questions,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch quiz questions',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

