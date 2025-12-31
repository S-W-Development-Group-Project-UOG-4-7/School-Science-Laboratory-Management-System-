import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/practicals - Get all practical sessions or a single practical by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const subject = searchParams.get('subject');
    const lab = searchParams.get('lab');

    // If ID is provided, fetch single practical
    if (id) {
      const practical = await prisma.practical.findUnique({
        where: { id: parseInt(id) },
      });

      if (!practical) {
        return NextResponse.json(
          {
            success: false,
            message: 'Practical not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Practical retrieved successfully',
          data: practical,
        },
        { status: 200 }
      );
    }

    // Otherwise, fetch multiple practicals with filters
    let where: any = {};

    if (subject) {
      where.subject = subject;
    }

    if (lab) {
      where.lab = lab;
    }

    // Fetch practicals
    const practicals = await prisma.practical.findMany({
      where,
      orderBy: {
        dateTime: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Practicals retrieved successfully',
        data: practicals,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching practicals:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch practicals',
        error: error.message,
      },
      { status: 500 }
    );
  }
}




