import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/app/lib/prisma';

/* =========================
   CONSTANTS
========================= */
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Science'] as const;
const GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Grade 13',
] as const;

/* =========================
   VALIDATION HELPERS
========================= */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePracticalInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 2) {
    errors.push('Title must be at least 2 characters long');
  }

  if (data.title && data.title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.subject || !SUBJECTS.includes(data.subject)) {
    errors.push(`Subject must be one of: ${SUBJECTS.join(', ')}`);
  }

  if (!data.grade || !GRADES.includes(data.grade)) {
    errors.push(`Grade must be one of: ${GRADES.join(', ')}`);
  }

  if (!data.teacherId || isNaN(Number(data.teacherId))) {
    errors.push('Valid teacherId is required');
  }

  if (data.duration && data.duration.length > 50) {
    errors.push('Duration must be less than 50 characters');
  }

  const urlFields = ['videoUrl', 'labSheetUrl', 'thumbnail'];
  urlFields.forEach((field) => {
    if (data[field] && !isValidUrl(data[field])) {
      errors.push(`${field} must be a valid URL`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/* =========================
   GET PRACTICALS
========================= */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get('search')?.trim();
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const teacherId = searchParams.get('teacherId');

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject && subject !== 'all') {
      where.subject = subject;
    }

    if (grade && grade !== 'all') {
      where.grade = grade;
    }

    if (teacherId && !isNaN(Number(teacherId))) {
      where.teacherId = Number(teacherId);
    }

    const [practicals, total] = await Promise.all([
      prisma.practical.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          quizzes: {
            include: {
              questions: true,
            },
          },
        },
      }),
      prisma.practical.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: practicals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ GET /practicals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch practicals' },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE PRACTICAL
========================= */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      subject,
      grade,
      duration = '45 min',
      videoUrl,
      labSheetUrl,
      thumbnail,
      teacherId,
    } = body;

    const validation = validatePracticalInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, details: validation.errors },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(teacherId) },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const practical = await prisma.practical.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        subject,
        grade,
        duration: duration.trim(),
        videoUrl: videoUrl?.trim() || null,
        labSheetUrl: labSheetUrl?.trim() || null,
        thumbnail: thumbnail?.trim() || null,
        teacherId: teacher.id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        quizzes: {
          include: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: practical },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ POST /practicals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create practical' },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE PRACTICAL
========================= */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Practical ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.practical.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Practical not found' },
        { status: 404 }
      );
    }

    const mergedData = { ...existing, ...updateData };
    const validation = validatePracticalInput(mergedData);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, details: validation.errors },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};

    if (updateData.title !== undefined)
      dataToUpdate.title = updateData.title.trim();
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description?.trim() || null;
    if (updateData.subject !== undefined)
      dataToUpdate.subject = updateData.subject;
    if (updateData.grade !== undefined)
      dataToUpdate.grade = updateData.grade;
    if (updateData.duration !== undefined)
      dataToUpdate.duration = updateData.duration.trim();
    if (updateData.videoUrl !== undefined)
      dataToUpdate.videoUrl = updateData.videoUrl?.trim() || null;
    if (updateData.labSheetUrl !== undefined)
      dataToUpdate.labSheetUrl = updateData.labSheetUrl?.trim() || null;
    if (updateData.thumbnail !== undefined)
      dataToUpdate.thumbnail = updateData.thumbnail?.trim() || null;
    if (updateData.teacherId !== undefined)
      dataToUpdate.teacherId = Number(updateData.teacherId);

    const practical = await prisma.practical.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: {
        teacher: { include: { user: true } },
        quizzes: { include: { questions: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: practical,
      message: 'Practical updated successfully',
    });
  } catch (error) {
    console.error('❌ PUT /practicals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update practical' },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE PRACTICAL
========================= */
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid practical ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.practical.findUnique({
      where: { id: Number(id) },
      include: { quizzes: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Practical not found' },
        { status: 404 }
      );
    }

    await prisma.practical.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Practical deleted successfully',
      deletedQuizzes: existing.quizzes.length,
    });
  } catch (error) {
    console.error('❌ DELETE /practicals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete practical' },
      { status: 500 }
    );
  }
}
