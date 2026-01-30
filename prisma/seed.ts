import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // NOTE: User deletion is commented out to preserve existing users
  console.log('🧹 Clearing existing data...');
  await (prisma as any).quizAttempt?.deleteMany?.();
  await (prisma as any).quizQuestion?.deleteMany?.();
  await (prisma as any).quiz?.deleteMany?.();

  await (prisma as any).note?.deleteMany?.();
  await (prisma as any).labSheetDownload?.deleteMany?.();
  await (prisma as any).practical?.deleteMany?.();
  // await prisma.user.deleteMany(); // COMMENTED OUT to preserve existing users

  // 1. Create 3 Users only if they don't already exist (preserve existing users)
  console.log('👥 Creating users (if they don\'t exist)...');
  // Hash default seed password so login comparisons work
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Ensure seed users exist (create if missing), then fetch them with IDs
  const seedUsers = [
    { name: 'John Doe', email: 'john.doe@school.edu' },
    { name: 'Jane Smith', email: 'jane.smith@school.edu' },
    { name: 'Bob Johnson', email: 'bob.johnson@school.edu' },
  ];

  // Use createMany to insert missing users (skip duplicates)
  await prisma.user.createMany({
    data: seedUsers.map((u) => ({
      name: u.name,
      email: u.email,
      role: 'STUDENT',
      password: hashedPassword,
    })),
    skipDuplicates: true,
  });

  // Fetch the users we care about (ordered to match seedUsers)
  const fetchedUsers = await prisma.user.findMany({
    where: { email: { in: seedUsers.map((u) => u.email) } },
  });
  const users: any[] = seedUsers.map((s) => fetchedUsers.find((f) => f.email === s.email)!);
  const students = users.filter((u: any) => u.role === 'STUDENT');
  console.log(`✅ Ensured ${users.length} seed users exist (${students.length} students)`);

  // 2. Create 3 Practicals
  console.log('🔬 Creating practicals...');
  const practicals: any[] = await Promise.all([
    (prisma as any).practical.create({
      data: {
        title: 'Chemistry Lab: Acid-Base Titration',
        subject: 'Chemistry',
        lab: 'Chemistry Lab A',
        dateTime: new Date('2024-12-20T10:00:00Z'),
      },
    }),
    (prisma as any).practical.create({
      data: {
        title: 'Physics Lab: Newton\'s Laws of Motion',
        subject: 'Physics',
        lab: 'Physics Lab B',
        dateTime: new Date('2024-12-21T14:00:00Z'),
      },
    }),
    (prisma as any).practical.create({
      data: {
        title: 'Biology Lab: Cell Structure and Function',
        subject: 'Biology',
        lab: 'Biology Lab C',
        dateTime: new Date('2024-12-22T09:00:00Z'),
      },
    }),
  ]);
  console.log(`✅ Created ${practicals.length} practicals`);

  // 3. Create 3 Note records
  console.log('📝 Creating notes...');
  const notes = await Promise.all([
    (prisma as any).note.create({
      data: {
        practicalId: practicals[0].id,
        title: 'Acid-Base Titration Guide',
        description: 'Complete guide to performing acid-base titrations safely and accurately.',
        fileUrl: 'https://example.com/notes/titration-guide.pdf',
      },
    }),
    (prisma as any).note.create({
      data: {
        practicalId: practicals[1].id,
        title: 'Newton\'s Laws Explained',
        description: 'Detailed explanation of Newton\'s three laws of motion with examples.',
        fileUrl: 'https://example.com/notes/newtons-laws.pdf',
      },
    }),
    (prisma as any).note.create({
      data: {
        practicalId: practicals[2].id,
        title: 'Cell Structure Study Notes',
        description: 'Comprehensive notes on cell structure and organelles.',
        fileUrl: 'https://example.com/notes/cell-structure.pdf',
      },
    }),
  ]);
  console.log(`✅ Created ${notes.length} notes`);

  // 4. Create 3 LabSheetDownload records
  console.log('📥 Creating lab sheet downloads...');
  const labSheetDownloads = await Promise.all([
    (prisma as any).labSheetDownload.create({
      data: {
        practicalId: practicals[0].id,
        downloadedById: users[0].id,
        fileUrl: 'https://example.com/labsheets/titration-labsheet.pdf',
        fileName: 'titration-labsheet.pdf',
      },
    }),
    (prisma as any).labSheetDownload.create({
      data: {
        practicalId: practicals[1].id,
        downloadedById: users[1].id,
        fileUrl: 'https://example.com/labsheets/newtons-laws-labsheet.pdf',
        fileName: 'newtons-laws-labsheet.pdf',
      },
    }),
    (prisma as any).labSheetDownload.create({
      data: {
        practicalId: practicals[2].id,
        downloadedById: users[2].id,
        fileUrl: 'https://example.com/labsheets/cell-structure-labsheet.pdf',
        fileName: 'cell-structure-labsheet.pdf',
      },
    }),
  ]);
  console.log(`✅ Created ${labSheetDownloads.length} lab sheet downloads`);



  // 5. Create quizzes for ALL practicals (ensuring every practical has a quiz)
  console.log('📚 Creating quizzes for all practicals...');
  const quizzes: any[] = await Promise.all(
    practicals.map((practical: any) =>
      (prisma as any).quiz.create({
        data: {
          practicalId: practical.id,
          title: `${practical.subject} Quiz: ${practical.title}`,
          totalMarks: 100,
        },
      })
    )
  );
  console.log(`✅ Created ${quizzes.length} quizzes (one for each practical)`);

  // 6. Create quiz questions for each quiz (1 question per quiz)
  console.log('❓ Creating quiz questions...');
  const quizQuestions = await Promise.all([
    (prisma as any).quizQuestion.create({
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
    (prisma as any).quizQuestion.create({
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
    (prisma as any).quizQuestion.create({
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

  // 7. Create 3 QuizAttempt records
  console.log('✍️ Creating quiz attempts...');
  const quizAttempts = await Promise.all([
    (prisma as any).quizAttempt.create({
      data: {
        quizId: quizzes[0].id,
        studentId: students[0].id,
        score: 90.0,
        answers: {
          [quizQuestions[0].id]: 'B',
        },
      },
    }),
    (prisma as any).quizAttempt.create({
      data: {
        quizId: quizzes[1].id,
        studentId: students[1].id,
        score: 85.0,
        answers: {
          [quizQuestions[1].id]: 'B',
        },
      },
    }),
    (prisma as any).quizAttempt.create({
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

  // 8. Create Inventory Items
  console.log('🧪 Creating inventory items...');
  // Clear inventory first
  await prisma.inventory.deleteMany();

  const inventoryItems = [
    {
      name: 'Microscope',
      category: 'Instruments',
      stockLevel: 15,
      minStockLevel: 5,
      unit: 'units',
      location: 'Cabinet A',
      storageInstructions: 'Store in a dry place with cover on.',
      handlingProcedure: 'Carry with both hands, one on the arm and one on the base.',
      safetyNotes: 'Avoid touching the lens with fingers.',
    },
    {
      name: 'Beaker',
      category: 'Glassware',
      stockLevel: 50,
      minStockLevel: 20,
      unit: 'units',
      location: 'Drawer 2',
      storageInstructions: 'Stack carefully in drawer.',
      handlingProcedure: 'Do not heat if cracked.',
      safetyNotes: 'Wear gloves when handling hot beakers.',
    },
    {
      name: 'Bunsen Burner',
      category: 'Equipment',
      stockLevel: 20,
      minStockLevel: 10,
      unit: 'units',
      location: 'Shelf B',
      storageInstructions: 'Ensure gas valve is closed before storage.',
      handlingProcedure: 'Inspect tubing for cracks before use.',
      safetyNotes: 'Tie back long hair when using.',
    },
    {
      name: 'Test Tube',
      category: 'Glassware',
      stockLevel: 200,
      minStockLevel: 50,
      unit: 'units',
      location: 'Drawer 1',
      storageInstructions: 'Store in test tube racks.',
      handlingProcedure: 'Use test tube holder when heating.',
      safetyNotes: 'Point away from face when heating.',
    },
    {
      name: 'Hydrochloric Acid',
      category: 'Chemicals',
      stockLevel: 5,
      minStockLevel: 2,
      unit: 'liters',
      location: 'Acid Cabinet',
      storageInstructions: 'Store in corrosive resistant cabinet.',
      handlingProcedure: 'Use in fume hood.',
      safetyNotes: 'Corrosive! Wear goggles and gloves.',
    },
    {
      name: 'Digital Balance',
      category: 'Instruments',
      stockLevel: 5,
      minStockLevel: 2,
      unit: 'units',
      location: 'Prep Room',
      storageInstructions: 'Keep clean and free of dust.',
      handlingProcedure: 'Do not overload.',
      safetyNotes: 'Ensure power cord is not a tripping hazard.',
    }
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.create({
      data: {
        ...item,
        category: item.category as any, // Cast to any to avoid Enum import issues if not available in context
      }
    });
  }
  console.log(`✅ Created ${inventoryItems.length} inventory items`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Practicals: ${practicals.length}`);
  console.log(`   - Notes: ${notes.length}`);
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



