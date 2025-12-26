import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Clearing existing data...');
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.reportSubmission.deleteMany();
  await prisma.note.deleteMany();
  await prisma.materialRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.practical.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create 3 Users (at least 3 students, plus some teachers/admins)
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@school.edu',
        role: 'STUDENT',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@school.edu',
        role: 'STUDENT',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob.johnson@school.edu',
        role: 'STUDENT',
      },
    }),
    // Removed TEACHER and LAB_ASSISTANT seed users per request
  ]);

  const students = users.filter(u => u.role === 'STUDENT');
  console.log(`✅ Created ${users.length} users (${students.length} students)`);

  // 2. Create 3 Practicals
  console.log('🔬 Creating practicals...');
  const practicals = await Promise.all([
    prisma.practical.create({
      data: {
        title: 'Chemistry Lab: Acid-Base Titration',
        subject: 'Chemistry',
        lab: 'Chemistry Lab A',
        dateTime: new Date('2024-12-20T10:00:00Z'),
      },
    }),
    prisma.practical.create({
      data: {
        title: 'Physics Lab: Newton\'s Laws of Motion',
        subject: 'Physics',
        lab: 'Physics Lab B',
        dateTime: new Date('2024-12-21T14:00:00Z'),
      },
    }),
    prisma.practical.create({
      data: {
        title: 'Biology Lab: Cell Structure and Function',
        subject: 'Biology',
        lab: 'Biology Lab C',
        dateTime: new Date('2024-12-22T09:00:00Z'),
      },
    }),
  ]);
  console.log(`✅ Created ${practicals.length} practicals`);

  // 3. Create 3 Attendance records
  console.log('📋 Creating attendance records...');
  const attendances = await Promise.all([
    prisma.attendance.create({
      data: {
        studentId: students[0].id,
        practicalId: practicals[0].id,
        status: 'PRESENT',
      },
    }),
    prisma.attendance.create({
      data: {
        studentId: students[1].id,
        practicalId: practicals[1].id,
        status: 'PRESENT',
      },
    }),
    prisma.attendance.create({
      data: {
        studentId: students[2].id,
        practicalId: practicals[2].id,
        status: 'LATE',
      },
    }),
  ]);
  console.log(`✅ Created ${attendances.length} attendance records`);

  // 4. Create 3 MaterialRequest records
  console.log('📦 Creating material requests...');
  const materialRequests = await Promise.all([
    prisma.materialRequest.create({
      data: {
        studentId: students[0].id,
        practicalId: practicals[0].id,
        itemName: 'Burette',
        quantity: 2,
        status: 'PENDING',
      },
    }),
    prisma.materialRequest.create({
      data: {
        studentId: students[1].id,
        practicalId: practicals[1].id,
        itemName: 'Pendulum Set',
        quantity: 1,
        status: 'APPROVED',
      },
    }),
    prisma.materialRequest.create({
      data: {
        studentId: students[2].id,
        practicalId: practicals[2].id,
        itemName: 'Microscope',
        quantity: 1,
        status: 'FULFILLED',
      },
    }),
  ]);
  console.log(`✅ Created ${materialRequests.length} material requests`);

  // 5. Create 3 Note records
  console.log('📝 Creating notes...');
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        practicalId: practicals[0].id,
        title: 'Acid-Base Titration Guide',
        description: 'Complete guide to performing acid-base titrations safely and accurately.',
        fileUrl: 'https://example.com/notes/titration-guide.pdf',
      },
    }),
    prisma.note.create({
      data: {
        practicalId: practicals[1].id,
        title: 'Newton\'s Laws Explained',
        description: 'Detailed explanation of Newton\'s three laws of motion with examples.',
        fileUrl: 'https://example.com/notes/newtons-laws.pdf',
      },
    }),
    prisma.note.create({
      data: {
        practicalId: practicals[2].id,
        title: 'Cell Structure Study Notes',
        description: 'Comprehensive notes on cell structure and organelles.',
        fileUrl: 'https://example.com/notes/cell-structure.pdf',
      },
    }),
  ]);
  console.log(`✅ Created ${notes.length} notes`);

  // 6. Create 3 ReportSubmission records
  console.log('📄 Creating report submissions...');
  const reportSubmissions = await Promise.all([
    prisma.reportSubmission.create({
      data: {
        studentId: students[0].id,
        practicalId: practicals[0].id,
        fileUrl: 'https://example.com/reports/john-titration-report.pdf',
        grade: 85.5,
        feedback: 'Good work! Pay attention to precision in measurements.',
      },
    }),
    prisma.reportSubmission.create({
      data: {
        studentId: students[1].id,
        practicalId: practicals[1].id,
        fileUrl: 'https://example.com/reports/jane-physics-report.pdf',
        grade: 92.0,
        feedback: 'Excellent analysis and presentation.',
      },
    }),
    prisma.reportSubmission.create({
      data: {
        studentId: students[2].id,
        practicalId: practicals[2].id,
        fileUrl: 'https://example.com/reports/bob-biology-report.pdf',
        grade: null,
        feedback: null,
      },
    }),
  ]);
  console.log(`✅ Created ${reportSubmissions.length} report submissions`);

  // 7. Create 3 Quiz records
  console.log('📚 Creating quizzes...');
  const quizzes = await Promise.all([
    prisma.quiz.create({
      data: {
        practicalId: practicals[0].id,
        title: 'Chemistry Quiz: Acid-Base Reactions',
        totalMarks: 100,
      },
    }),
    prisma.quiz.create({
      data: {
        practicalId: practicals[1].id,
        title: 'Physics Quiz: Motion and Forces',
        totalMarks: 100,
      },
    }),
    prisma.quiz.create({
      data: {
        practicalId: practicals[2].id,
        title: 'Biology Quiz: Cell Biology',
        totalMarks: 100,
      },
    }),
  ]);
  console.log(`✅ Created ${quizzes.length} quizzes`);

  // 8. Create 3 QuizQuestion records (one for each quiz)
  console.log('❓ Creating quiz questions...');
  const quizQuestions = await Promise.all([
    prisma.quizQuestion.create({
      data: {
        quizId: quizzes[0].id,
        questionText: 'What is the pH of a neutral solution?',
        optionA: '5',
        optionB: '7',
        optionC: '9',
        optionD: '11',
        correctAnswer: 'B',
        marks: 10,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quizzes[1].id,
        questionText: 'What is Newton\'s First Law of Motion?',
        optionA: 'F = ma',
        optionB: 'An object at rest stays at rest',
        optionC: 'Every action has an equal reaction',
        optionD: 'Energy cannot be created or destroyed',
        correctAnswer: 'B',
        marks: 10,
      },
    }),
    prisma.quizQuestion.create({
      data: {
        quizId: quizzes[2].id,
        questionText: 'Which organelle is responsible for protein synthesis?',
        optionA: 'Mitochondria',
        optionB: 'Ribosome',
        optionC: 'Nucleus',
        optionD: 'Golgi Apparatus',
        correctAnswer: 'B',
        marks: 10,
      },
    }),
  ]);
  console.log(`✅ Created ${quizQuestions.length} quiz questions`);

  // 9. Create 3 QuizAttempt records
  console.log('✍️ Creating quiz attempts...');
  const quizAttempts = await Promise.all([
    prisma.quizAttempt.create({
      data: {
        quizId: quizzes[0].id,
        studentId: students[0].id,
        score: 90.0,
        answers: {
          [quizQuestions[0].id]: 'B',
        },
      },
    }),
    prisma.quizAttempt.create({
      data: {
        quizId: quizzes[1].id,
        studentId: students[1].id,
        score: 85.0,
        answers: {
          [quizQuestions[1].id]: 'B',
        },
      },
    }),
    prisma.quizAttempt.create({
      data: {
        quizId: quizzes[2].id,
        studentId: students[2].id,
        score: 75.0,
        answers: {
          [quizQuestions[2].id]: 'B',
        },
      },
    }),
  ]);
  console.log(`✅ Created ${quizAttempts.length} quiz attempts`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Practicals: ${practicals.length}`);
  console.log(`   - Attendance: ${attendances.length}`);
  console.log(`   - Material Requests: ${materialRequests.length}`);
  console.log(`   - Notes: ${notes.length}`);
  console.log(`   - Report Submissions: ${reportSubmissions.length}`);
  console.log(`   - Quizzes: ${quizzes.length}`);
  console.log(`   - Quiz Questions: ${quizQuestions.length}`);
  console.log(`   - Quiz Attempts: ${quizAttempts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

