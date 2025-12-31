import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate default quiz questions based on subject
function getDefaultQuizQuestions(subject: string) {
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('chemistry')) {
    return [
      {
        questionText: 'What is the pH of a neutral solution?',
        optionA: '5',
        optionB: '7',
        optionC: '9',
        optionD: '11',
        correctAnswer: 'B' as const,
        marks: 10,
      },
      {
        questionText: 'What is the chemical formula for water?',
        optionA: 'H2O',
        optionB: 'CO2',
        optionC: 'NaCl',
        optionD: 'O2',
        correctAnswer: 'A' as const,
        marks: 10,
      },
    ];
  } else if (subjectLower.includes('physics')) {
    return [
      {
        questionText: 'What is Newton\'s First Law of Motion?',
        optionA: 'F = ma',
        optionB: 'An object at rest stays at rest',
        optionC: 'Every action has an equal reaction',
        optionD: 'Energy cannot be created or destroyed',
        correctAnswer: 'B' as const,
        marks: 10,
      },
      {
        questionText: 'What is the unit of force?',
        optionA: 'Joule',
        optionB: 'Newton',
        optionC: 'Watt',
        optionD: 'Pascal',
        correctAnswer: 'B' as const,
        marks: 10,
      },
    ];
  } else if (subjectLower.includes('biology')) {
    return [
      {
        questionText: 'Which organelle is responsible for protein synthesis?',
        optionA: 'Mitochondria',
        optionB: 'Ribosome',
        optionC: 'Nucleus',
        optionD: 'Golgi Apparatus',
        correctAnswer: 'B' as const,
        marks: 10,
      },
      {
        questionText: 'What is the basic unit of life?',
        optionA: 'Tissue',
        optionB: 'Organ',
        optionC: 'Cell',
        optionD: 'Organelle',
        correctAnswer: 'C' as const,
        marks: 10,
      },
    ];
  }
  
  // Default questions for unknown subjects
  return [
    {
      questionText: 'What is the main purpose of this practical?',
      optionA: 'To observe and record data',
      optionB: 'To understand scientific principles',
      optionC: 'To apply theoretical knowledge',
      optionD: 'All of the above',
      correctAnswer: 'D' as const,
      marks: 10,
    },
  ];
}

// POST /api/quizzes - Create quizzes for all practicals that don't have one
export async function POST(request: NextRequest) {
  try {
    // Get all practicals
    const allPracticals = await prisma.practical.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
      },
    });

    // Get all existing quizzes with their practicalIds
    const existingQuizzes = await prisma.quiz.findMany({
      select: {
        practicalId: true,
      },
    });

    const existingPracticalIds = new Set(existingQuizzes.map(q => q.practicalId));

    // Find practicals without quizzes
    const practicalsWithoutQuizzes = allPracticals.filter(
      p => !existingPracticalIds.has(p.id)
    );

    // Create quizzes for practicals that don't have one
    const createdQuizzes = [];
    for (const practical of practicalsWithoutQuizzes) {
      const defaultQuestions = getDefaultQuizQuestions(practical.subject);
      const totalMarks = defaultQuestions.reduce((sum, q) => sum + q.marks, 0);
      const quizTitle = `${practical.subject} Quiz: ${practical.title}`;

      const newQuiz = await prisma.quiz.create({
        data: {
          practicalId: practical.id,
          title: quizTitle,
          totalMarks: totalMarks,
          questions: {
            create: defaultQuestions,
          },
        },
      });

      createdQuizzes.push(newQuiz);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Created ${createdQuizzes.length} quiz(es) for practicals without quizzes`,
        data: {
          created: createdQuizzes.length,
          total: allPracticals.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error creating quizzes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create quizzes',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/quizzes - Get quizzes (with optional practicalId filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practicalId = searchParams.get('practicalId');

    let where: any = {};

    if (practicalId) {
      const parsedPracticalId = parseInt(practicalId);
      
      // Validate practicalId
      if (isNaN(parsedPracticalId)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid practicalId',
          },
          { status: 400 }
        );
      }

      where.practicalId = parsedPracticalId;

      // Check if quiz exists for this practical
      const existingQuiz = await prisma.quiz.findFirst({
        where: { practicalId: parsedPracticalId },
        include: {
          practical: {
            select: {
              id: true,
              title: true,
              subject: true,
              lab: true,
              dateTime: true,
            },
          },
          questions: {
            select: {
              id: true,
              questionText: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              marks: true,
            },
          },
          _count: {
            select: {
              quizAttempts: true,
            },
          },
        },
      });

      // If quiz exists, return it
      if (existingQuiz) {
        return NextResponse.json(
          {
            success: true,
            message: 'Quiz retrieved successfully',
            data: [existingQuiz],
          },
          { status: 200 }
        );
      }

      // If no quiz exists, try to create one automatically
      // Fetch the practical to get its details
      const practical = await prisma.practical.findUnique({
        where: { id: parsedPracticalId },
      });

      if (practical) {
        // Generate quiz title based on practical
        const quizTitle = `${practical.subject} Quiz: ${practical.title}`;
        
        // Get default questions based on subject
        const defaultQuestions = getDefaultQuizQuestions(practical.subject);
        
        // Calculate total marks
        const totalMarks = defaultQuestions.reduce((sum, q) => sum + q.marks, 0);

        // Create quiz with questions
        const newQuiz = await prisma.quiz.create({
          data: {
            practicalId: parsedPracticalId,
            title: quizTitle,
            totalMarks: totalMarks,
            questions: {
              create: defaultQuestions,
            },
          },
          include: {
            practical: {
              select: {
                id: true,
                title: true,
                subject: true,
                lab: true,
                dateTime: true,
              },
            },
            questions: {
              select: {
                id: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                marks: true,
              },
            },
            _count: {
              select: {
                quizAttempts: true,
              },
            },
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Quiz created and retrieved successfully',
            data: [newQuiz],
          },
          { status: 200 }
        );
      } else {
        // Practical doesn't exist in database
        return NextResponse.json(
          {
            success: false,
            message: 'Practical not found in database',
            data: [],
          },
          { status: 404 }
        );
      }
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        practical: {
          select: {
            id: true,
            title: true,
            subject: true,
            lab: true,
            dateTime: true,
          },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
            // Don't include correctAnswer in the response for security
          },
        },
        _count: {
          select: {
            quizAttempts: true,
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
        message: 'Quizzes retrieved successfully',
        data: quizzes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch quizzes',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

