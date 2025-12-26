import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quizzes/attempt - Get quiz attempts for a student
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    // Validation
    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameter: studentId',
        },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found or invalid student ID',
        },
        { status: 404 }
      );
    }

    // Build where clause
    let where: any = {
      studentId: parseInt(studentId),
    };

    if (quizId) {
      where.quizId = parseInt(quizId);
    }

    // Fetch quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            practical: {
              select: {
                id: true,
                title: true,
                subject: true,
                lab: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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
        message: 'Quiz attempts retrieved successfully',
        data: attempts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch quiz attempts',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/quizzes/attempt - Submit quiz answers and calculate score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, studentId, answers } = body;

    // Validation
    if (!quizId || !studentId || !answers) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: quizId, studentId, and answers are required',
        },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Student not found or invalid student ID',
        },
        { status: 404 }
      );
    }

    // Verify quiz exists and fetch questions with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: {
        questions: true,
        practical: {
          select: {
            id: true,
            title: true,
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

    // Check if student already attempted this quiz
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId: parseInt(quizId),
          studentId: parseInt(studentId),
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quiz already attempted. You cannot submit multiple attempts.',
        },
        { status: 409 }
      );
    }

    // Calculate score
    let totalScore = 0;
    let maxMarks = 0;

    quiz.questions.forEach((question) => {
      maxMarks += question.marks;
      const studentAnswer = answers[question.id.toString()];
      if (studentAnswer === question.correctAnswer) {
        totalScore += question.marks;
      }
    });

    const percentageScore = maxMarks > 0 ? (totalScore / maxMarks) * quiz.totalMarks : 0;

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId: parseInt(quizId),
        studentId: parseInt(studentId),
        score: percentageScore,
        answers: answers,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            practical: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quiz attempt submitted successfully',
        data: {
          ...quizAttempt,
          detailedScore: {
            obtainedMarks: totalScore,
            maxMarks: maxMarks,
            percentage: percentageScore,
            totalQuizMarks: quiz.totalMarks,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit quiz attempt',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

