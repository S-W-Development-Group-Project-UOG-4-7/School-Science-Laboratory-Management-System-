import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.inventory.createMany({
    data: [
      {
        name: 'Beakers (250ml)',
        category: 'Glassware',
        stockLevel: 35,
        minStockLevel: 20,
        unit: 'pieces',
        location: 'Cabinet A2 - Shelf 3',
        photo: 'https://images.unsplash.com/photo-1761095596584-34731de3e568',
        storageInstructions: 'Store in a dry place.',
        handlingProcedure: 'Handle with care.',
        safetyNotes: 'Wear gloves.',
      },
    ],
  });

  console.log('Inventory seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

