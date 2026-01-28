import { PrismaClient, Role, DayOfWeek } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean tables (ORDER MATTERS)
  await prisma.practical.deleteMany()
  await prisma.teacherTimetable.deleteMany()
  await prisma.labTimetable.deleteMany()
  await prisma.lab.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Deputy Principal',
      email: 'admin@school.lk',
      password: 'admin123',
      role: Role.ADMIN,
    },
  })

  const teacher = await prisma.user.create({
    data: {
      name: 'Science Teacher',
      email: 'teacher@school.lk',
      password: 'teacher123',
      role: Role.TEACHER,
    },
  })

  // Create labs
  const physicsLab = await prisma.lab.create({
    data: {
      name: 'Physics Lab',
    },
  })

  const chemistryLab = await prisma.lab.create({
    data: {
      name: 'Chemistry Lab',
    },
  })

  // Teacher timetable
  await prisma.teacherTimetable.create({
    data: {
      teacherId: teacher.id,
      day: DayOfWeek.MONDAY,
      period: 3,
      subject: 'Science',
      grade: 9,
      available: true,
    },
  })

  // Lab timetable
  await prisma.labTimetable.create({
    data: {
      labId: physicsLab.id,
      day: DayOfWeek.MONDAY,
      period: 3,
      available: true,
    },
  })

  console.log('✅ Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



