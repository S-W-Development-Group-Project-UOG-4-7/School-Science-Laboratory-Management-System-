import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
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
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedQuiz = {
      ...quiz,
      isPublished: quiz.status === 'PUBLISHED'
    };

    return NextResponse.json(formattedQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Update quiz
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        totalMarks: body.totalMarks,
        passingMarks: body.passingMarks,
        timeLimit: body.timeLimit,
        status: body.status
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

    return NextResponse.json(formattedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete quiz (questions will cascade delete)
    await prisma.quiz.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}