import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = parseInt(params.teacherId);
    
    const practicals = await prisma.practical.findMany({
      where: { teacherId },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(practicals);
  } catch (error) {
    console.error('Error fetching teacher practicals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher practicals' },
      { status: 500 }
    );
  }
}