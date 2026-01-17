import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const practical = await prisma.practical.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!practical) {
      return NextResponse.json(
        { error: 'Practical not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(practical);
  } catch (error) {
    console.error('Error fetching practical:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practical' },
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

    // Check if practical exists
    const existingPractical = await prisma.practical.findUnique({
      where: { id }
    });

    if (!existingPractical) {
      return NextResponse.json(
        { error: 'Practical not found' },
        { status: 404 }
      );
    }

    const practical = await prisma.practical.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        grade: body.grade,
        duration: body.duration,
        videoUrl: body.videoUrl,
        labSheetUrl: body.labSheetUrl,
        thumbnail: body.thumbnail
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(practical);
  } catch (error) {
    console.error('Error updating practical:', error);
    return NextResponse.json(
      { error: 'Failed to update practical' },
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

    // Check if practical exists
    const existingPractical = await prisma.practical.findUnique({
      where: { id }
    });

    if (!existingPractical) {
      return NextResponse.json(
        { error: 'Practical not found' },
        { status: 404 }
      );
    }

    // Delete related quizzes first (due to cascade delete in schema)
    await prisma.quiz.deleteMany({
      where: { practicalId: id }
    });

    // Delete the practical
    await prisma.practical.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Practical deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting practical:', error);
    return NextResponse.json(
      { error: 'Failed to delete practical' },
      { status: 500 }
    );
  }
}