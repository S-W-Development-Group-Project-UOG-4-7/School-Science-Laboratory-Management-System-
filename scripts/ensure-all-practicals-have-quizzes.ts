/**
 * Utility script to ensure all practicals in the database have quizzes
 * Run this script to create quizzes for any practicals that don't have one
 * 
 * Usage: npx tsx scripts/ensure-all-practicals-have-quizzes.ts
 */

import type { User } from '@/lib/types';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

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

async function ensureAllPracticalsHaveQuizzes() {
  try {
    console.log('🔍 Checking for practicals without quizzes...');

    // Get all practicals
    const allPracticals = await prisma.practical.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
      },
    });

    console.log(`📚 Found ${allPracticals.length} practical(s) in database`);

    // Get all existing quizzes with their practicalIds
    const existingQuizzes = await prisma.quiz.findMany({
      select: {
        practicalId: true,
      },
    });

    const existingPracticalIds = new Set(existingQuizzes.map(q => q.practicalId));
    console.log(`✅ Found ${existingQuizzes.length} existing quiz(es)`);

    // Find practicals without quizzes
    const practicalsWithoutQuizzes = allPracticals.filter(
      p => !existingPracticalIds.has(p.id)
    );

    if (practicalsWithoutQuizzes.length === 0) {
      console.log('✅ All practicals already have quizzes!');
      return;
    }

    console.log(`⚠️  Found ${practicalsWithoutQuizzes.length} practical(s) without quizzes:`);
    practicalsWithoutQuizzes.forEach(p => {
      console.log(`   - ID ${p.id}: ${p.title} (${p.subject})`);
    });

    // Create quizzes for practicals that don't have one
    console.log('\n📝 Creating quizzes...');
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
      console.log(`   ✅ Created quiz for: ${practical.title}`);
    }

    console.log(`\n✅ Successfully created ${createdQuizzes.length} quiz(es)!`);
    console.log(`📊 Summary: ${allPracticals.length} total practicals, all now have quizzes`);
  } catch (error: any) {
    console.error('❌ Error ensuring all practicals have quizzes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureAllPracticalsHaveQuizzes()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

