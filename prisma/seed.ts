import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "Saviru Ranasinghe", email: "saviru@example.com" },
    { name: "Dilshan Perera", email: "dilshan@example.com" },
    { name: "Kasun Fernando", email: "kasun@example.com" },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  console.log("✅ Seed data inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });




