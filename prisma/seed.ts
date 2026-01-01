import { prisma } from '../src/app/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Oshani',
      email: 'oshani@example.com',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  await prisma.teacher.create({
    data: {
      userId: user.id,
      subject: 'Chemistry',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
