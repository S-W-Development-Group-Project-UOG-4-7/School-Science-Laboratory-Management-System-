// src/app/test-prisma.cjs
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
      },
    });

    console.log('Created user:', newUser);

    const users = await prisma.user.findMany();
    console.log('All users:', users);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
