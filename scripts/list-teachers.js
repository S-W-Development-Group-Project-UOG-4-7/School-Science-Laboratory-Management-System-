const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\nListing teacher users and Teacher rows...');
  const users = await prisma.user.findMany({
    where: {},
    include: { teacher: true },
    orderBy: { id: 'asc' },
  });

  users.forEach(u => {
    console.log(`User id=${u.id} email=${u.email} role=${u.role} teacherId=${u.teacher ? u.teacher.id : 'MISSING'}`);
  });

  const teachers = await prisma.teacher.findMany({ include: { user: true } });
  console.log('\nTeacher table rows:');
  teachers.forEach(t => {
    console.log(`Teacher id=${t.id} userId=${t.userId} userEmail=${t.user?.email || 'unknown'}`);
  });

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });