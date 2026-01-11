
import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing inventory fetch...');
        const inventories = await prisma.inventory.findMany();
        console.log('Successfully fetched inventories:', inventories);
    } catch (error) {
        console.error('Error fetching inventories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
