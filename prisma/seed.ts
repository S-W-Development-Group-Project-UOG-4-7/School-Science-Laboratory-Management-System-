import { prisma } from '../src/app/lib/prisma';

async function main() {
  await prisma.user.create({
    data: {
      name: 'Oshani',
      email: 'oshani@example.com',
    },
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
