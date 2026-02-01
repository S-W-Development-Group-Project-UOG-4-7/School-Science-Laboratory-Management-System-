const { PrismaClient, ScheduleStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teacherId = 2;
  const schedules = await prisma.practicalSchedule.findMany({
    where: {
      teacherId,
      status: ScheduleStatus.UPCOMING,
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${schedules.length} upcoming schedule(s) for teacherId=${teacherId}`);
  schedules.forEach(s => {
    console.log(`id=${s.id} date=${s.date.toISOString()} period=${s.period} class=${s.fullClassName || s.className} title=${s.title}`);
  });

  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); prisma.$disconnect(); process.exit(1)});