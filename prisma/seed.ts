import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password
  const hashedPassword1 = await bcrypt.hash('admin123', 10);
  const hashedPassword2 = await bcrypt.hash('teacher123', 10);
  const hashedPassword3 = await bcrypt.hash('principal123', 10);
  const hashedPassword4 = await bcrypt.hash('labassist123', 10);
  const hashedPassword5 = await bcrypt.hash('student123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.lk' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@school.lk',
      password: hashedPassword1,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create principal
  const principal = await prisma.user.upsert({
    where: { email: 'principal@school.lk' },
    update: {},
    create: {
      name: 'Principal Silva',
      email: 'principal@school.lk',
      password: hashedPassword3,
      role: 'PRINCIPAL',
      status: 'ACTIVE',
    },
  });

  // Create a teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.lk' },
    update: {},
    create: {
      name: 'Mr. Perera',
      email: 'teacher@school.lk',
      password: hashedPassword2,
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  });

  // Create a lab assistant
  const labAssistant = await prisma.user.upsert({
    where: { email: 'labassist@school.lk' },
    update: {},
    create: {
      name: 'Lab Assistant Kumar',
      email: 'labassist@school.lk',
      password: hashedPassword5,
      role: 'LAB_ASSISTANT',
      status: 'ACTIVE',
    },
  });

  // Create a student
  const student = await prisma.user.upsert({
    where: { email: 'student@school.lk' },
    update: {},
    create: {
      name: 'Student Amal',
      email: 'student@school.lk',
      password: hashedPassword5,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Default password for all users: admin123');
  console.log({ admin, principal, teacher, labAssistant, student });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });