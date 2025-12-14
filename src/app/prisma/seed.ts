// prisma/seed.ts
import { prisma } from '../../lib/prisma';

async function main() {
  await prisma.user.create({
    data: { name: "Oshani", email: "oshani@example.com" },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
