const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: {
      role: { in: ['TEACHER', 'LAB_ASSISTANT'] },
    },
  });
  console.log(`Deleted ${result.count} users with role TEACHER or LAB_ASSISTANT`);
}

main()
  .catch((e) => {
    console.error('Error deleting users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
