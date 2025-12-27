import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/practicals - Get all practical sessions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const lab = searchParams.get('lab');

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



