import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DifficultyLevel } from '@prisma/client';

// Validation schemas
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Science'] as const;
const GRADES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'] as const;
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

// Helper function to validate input
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

  if (data.difficulty && !DIFFICULTIES.includes(data.difficulty.toUpperCase())) {
    errors.push(`Difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }

  if (!data.teacherId || isNaN(Number(data.teacherId))) {
    errors.push('Valid teacherId is required');
  }

  if (data.duration && data.duration.length > 50) {
    errors.push('Duration must be less than 50 characters');
  }

  // URL validation if provided
  const urlFields = ['videoUrl', 'labSheetUrl', 'thumbnail'];
  urlFields.forEach(field => {
    if (data[field] && !isValidUrl(data[field])) {
      errors.push(`${field} must be a valid URL`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* =========================
   GET PRACTICALS
========================= */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/practicals called');
    
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const search = searchParams.get('search')?.trim();
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const difficulty = searchParams.get('difficulty');
    const teacherId = searchParams.get('teacherId');

    console.log('🔍 Query params:', { search, subject, grade, difficulty, teacherId });

    // Pagination
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search && search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject && subject !== 'all') {
      if (!SUBJECTS.includes(subject as any)) {
        return NextResponse.json({
          success: false,
          error: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}`,
        }, { status: 400 });
      }
      where.subject = subject;
    }

    if (grade && grade !== 'all') {
      if (!GRADES.includes(grade as any)) {
        return NextResponse.json({
          success: false,
          error: `Invalid grade. Must be one of: ${GRADES.join(', ')}`,
        }, { status: 400 });
      }
      where.grade = grade;
    }

    if (difficulty && difficulty !== 'all') {
      const difficultyUpper = difficulty.toUpperCase();
      if (!DIFFICULTIES.includes(difficultyUpper as any)) {
        return NextResponse.json({
          success: false,
          error: `Invalid difficulty. Must be one of: ${DIFFICULTIES.join(', ')}`,
        }, { status: 400 });
      }
      where.difficulty = difficultyUpper as DifficultyLevel;
    }

    if (teacherId && !isNaN(Number(teacherId))) {
      where.teacherId = Number(teacherId);
    }

    console.log('🔍 Prisma where clause:', JSON.stringify(where, null, 2));

    // Execute queries in parallel
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
                  role: true 
                } 
              } 
            } 
          },
          quizzes: {
            include: {
              questions: true,
            }
          },
        },
      }),
      prisma.practical.count({ where }),
    ]);

    console.log(`✅ Found ${practicals.length} practicals out of ${total} total`);

    return NextResponse.json({
      success: true,
      data: practicals,
      meta: {
        pagination: { 
          total, 
          page, 
          limit, 
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        filters: {
          search: search || undefined,
          subject: subject || undefined,
          grade: grade || undefined,
          difficulty: difficulty || undefined,
          teacherId: teacherId || undefined,
        }
      },
    });
  } catch (error) {
    console.error('❌ GET /practicals error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch practicals',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/* =========================
   CREATE PRACTICAL
========================= */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 POST /api/practicals called');
    
    const body = await request.json();
    console.log('📤 Request body:', body);
    
    const { 
      title, 
      description, 
      subject, 
      grade, 
      duration = '45 min', 
      difficulty = 'INTERMEDIATE', 
      videoUrl, 
      labSheetUrl, 
      thumbnail, 
      teacherId 
    } = body;

    console.log('📤 Parsed fields:', { 
      title, subject, grade, teacherId, 
      duration, difficulty 
    });

    // Validate input
    const validation = validatePracticalInput({ title, subject, grade, teacherId, difficulty, duration, videoUrl, labSheetUrl, thumbnail });
    
    if (!validation.valid) {
      console.error('❌ Validation errors:', validation.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({ 
      where: { id: Number(teacherId) },
      include: { user: true }
    });
    
    if (!teacher) {
      console.error(`❌ Teacher not found with ID: ${teacherId}`);
      return NextResponse.json({ 
        success: false, 
        error: `Teacher not found with ID: ${teacherId}` 
      }, { status: 404 });
    }

    console.log('✅ Teacher found:', teacher.user?.name);

    // Create practical
    const practical = await prisma.practical.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        subject,
        grade,
        duration: duration.trim(),
        difficulty: difficulty.toUpperCase() as DifficultyLevel,
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
                role: true 
              } 
            } 
          } 
        },
        quizzes: {
          include: {
            questions: true,
          }
        },
      },
    });

    console.log('✅ Practical created:', practical.id, practical.title);

    return NextResponse.json({ 
      success: true, 
      data: practical,
      message: 'Practical created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST /practicals error:', error);
    
    let errorMessage = 'Failed to create practical';
    let details = null;
    
    if (error?.code === 'P2003') {
      errorMessage = 'Invalid teacherId (foreign key error)';
    } else if (error?.code === 'P2002') {
      errorMessage = 'A practical with similar data already exists';
      details = error.meta?.target;
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: details || (error instanceof Error ? error.message : null)
    }, { status: 500 });
  }
}

/* =========================
   UPDATE PRACTICAL
========================= */
export async function PUT(request: NextRequest) {
  try {
    console.log('📤 PUT /api/practicals called');

    // Parse request body
    const body = await request.json();
    console.log('📤 Request body:', body);

    const { id, ...updateData } = body;

    if (!id) {
      console.error('❌ Practical ID is required');
      return NextResponse.json({
        success: false,
        error: 'Practical ID is required',
      }, { status: 400 });
    }

    console.log(`📤 Updating practical ID: ${id}`, updateData);

    // Check if practical exists
    const existingPractical = await prisma.practical.findUnique({
      where: { id: Number(id) }
    });

    if (!existingPractical) {
      console.error(`❌ Practical with ID ${id} not found`);
      return NextResponse.json({
        success: false,
        error: 'Practical not found',
      }, { status: 404 });
    }

    // Validate update data if any fields are being updated
    const dataToValidate = { ...existingPractical, ...updateData };
    const validation = validatePracticalInput(dataToValidate);
    
    if (!validation.valid) {
      console.error('❌ Validation errors:', validation.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Validate teacher if being updated
    if (updateData.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(updateData.teacherId) }
      });

      if (!teacher) {
        console.error(`❌ Teacher not found with ID: ${updateData.teacherId}`);
        return NextResponse.json({
          success: false,
          error: 'Teacher not found',
        }, { status: 404 });
      }
    }

    // Prepare data for update
    const dataToUpdate: any = {};
    
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title.trim();
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description?.trim() || null;
    if (updateData.subject !== undefined) dataToUpdate.subject = updateData.subject;
    if (updateData.grade !== undefined) dataToUpdate.grade = updateData.grade;
    if (updateData.duration !== undefined) dataToUpdate.duration = updateData.duration.trim();
    if (updateData.difficulty !== undefined) dataToUpdate.difficulty = updateData.difficulty.toUpperCase() as DifficultyLevel;
    if (updateData.videoUrl !== undefined) dataToUpdate.videoUrl = updateData.videoUrl?.trim() || null;
    if (updateData.labSheetUrl !== undefined) dataToUpdate.labSheetUrl = updateData.labSheetUrl?.trim() || null;
    if (updateData.thumbnail !== undefined) dataToUpdate.thumbnail = updateData.thumbnail?.trim() || null;
    if (updateData.teacherId !== undefined) dataToUpdate.teacherId = Number(updateData.teacherId);

    // Update practical
    const practical = await prisma.practical.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        quizzes: {
          include: {
            questions: true,
          }
        },
      },
    });

    console.log(`✅ Practical ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      data: practical,
      message: 'Practical updated successfully'
    });

  } catch (error: any) {
    console.error('❌ PUT /practicals error:', error);

    let errorMessage = 'Failed to update practical';
    let details = null;
    
    if (error?.code === 'P2025') {
      errorMessage = 'Practical not found';
    } else if (error?.code === 'P2002') {
      errorMessage = 'A practical with similar data already exists';
      details = error.meta?.target;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: details || (error instanceof Error ? error.message : null)
    }, { status: 500 });
  }
}

/* =========================
   DELETE PRACTICAL
========================= */
export async function DELETE(request: NextRequest) {
  try {
    console.log('📤 DELETE /api/practicals called');
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    console.log('📤 Delete ID:', id);
    
    if (!id) {
      console.error('❌ Practical ID is required');
      return NextResponse.json({ 
        success: false, 
        error: 'Practical ID is required' 
      }, { status: 400 });
    }

    const practicalId = Number(id);
    
    if (isNaN(practicalId)) {
      console.error('❌ Invalid practical ID:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid practical ID' 
      }, { status: 400 });
    }

    // Check if practical exists before deleting
    const existingPractical = await prisma.practical.findUnique({
      where: { id: practicalId },
      include: { quizzes: true }
    });

    if (!existingPractical) {
      console.error(`❌ Practical with ID ${id} not found`);
      return NextResponse.json({ 
        success: false, 
        error: `Practical with ID ${id} not found` 
      }, { status: 404 });
    }

    console.log(`🗑️ Deleting practical ${id} with ${existingPractical.quizzes.length} quizzes`);

    // Delete the practical (this will cascade delete quizzes if configured in Prisma schema)
    await prisma.practical.delete({
  where: { id: practicalId }
});



    console.log(`✅ Practical ${id} deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Practical deleted successfully',
      deletedQuizzes: existingPractical.quizzes.length
    });
  } catch (error: any) {
    console.error('❌ DELETE /practicals error:', error);
    
    let errorMessage = 'Failed to delete practical';
    let details = null;
    
    if (error?.code === 'P2025') {
      errorMessage = `Practical not found`;
    } else if (error?.code === 'P2014') {
      errorMessage = 'Cannot delete practical due to existing references';
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: details || (error instanceof Error ? error.message : null)
    }, { status: 500 });
  }
}