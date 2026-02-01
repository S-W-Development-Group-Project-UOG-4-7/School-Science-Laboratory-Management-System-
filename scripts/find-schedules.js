const { PrismaClient, ScheduleStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teacherId = 2;
  const dateStr = '2026-02-03';
  const period = '2';

  const start = new Date(dateStr + 'T00:00:00.000Z');
  const end = new Date(dateStr + 'T23:59:59.999Z');

  const schedules = await prisma.practicalSchedule.findMany({
    where: {
      teacherId,
      period,
      date: { gte: start, lte: end },
      status: ScheduleStatus.UPCOMING,
    },
  });

  console.log(`Found ${schedules.length} upcoming schedule(s) for teacherId=${teacherId} on ${dateStr} period=${period}`);
  schedules.forEach(s => {
    console.log(JSON.stringify(s, null, 2));
  });

  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); prisma.$disconnect(); process.exit(1)});