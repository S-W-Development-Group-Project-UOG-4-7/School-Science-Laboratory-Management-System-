import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/practicals called'); // Debug log
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');

    const practicals = await prisma.practical.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          subject ? { subject } : {},
          grade ? { grade } : {}
        ]
      },
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

    console.log(`Found ${practicals.length} practicals`); // Debug log
    return NextResponse.json(practicals);
  } catch (error) {
    console.error('Error fetching practicals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practicals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/practicals called'); // Debug log
    
    const body = await request.json();
    console.log('Request body:', body); // Debug log
    
    // Validate required fields
    const requiredFields = ['title', 'subject', 'grade', 'teacherId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}`); // Debug log
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('Creating practical in database...'); // Debug log
    const practical = await prisma.practical.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        grade: body.grade,
        duration: body.duration || '45 min',
        videoUrl: body.videoUrl,
        labSheetUrl: body.labSheetUrl,
        thumbnail: body.thumbnail,
        teacherId: body.teacherId
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('Practical created successfully:', practical); // Debug log
    return NextResponse.json(practical, { status: 201 });
  } catch (error) {
    console.error('Error creating practical:', error);
    return NextResponse.json(
      { error: 'Failed to create practical' },
      { status: 500 }
    );
  }
}