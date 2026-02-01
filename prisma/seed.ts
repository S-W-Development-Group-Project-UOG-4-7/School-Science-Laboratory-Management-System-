import { PrismaClient, Role, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean tables (ORDER MATTERS)
  await prisma.teacherTimetable.deleteMany();
  await prisma.labTimetable.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.user.deleteMany();

  // -----------------------------
  // Create users
  // -----------------------------
  const deputyPrincipal = await prisma.user.create({
    data: {
      name: "Deputy Principal",
      email: "deputyprincipal@school.lk",
      password: "deputy123",
      role: Role.DEPUTY_PRINCIPAL,
    },
  });

  // Teacher 1 (your one)
  const teacher1 = await prisma.user.create({
    data: {
      name: "Mrs Jayasuriya",
      email: "teacher@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
    },
  });

  // Teacher 2
  const teacher2 = await prisma.user.create({
    data: {
      name: "Mr Perera",
      email: "perera@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
    },
  });

  // Teacher 3
  const teacher3 = await prisma.user.create({
    data: {
      name: "Ms Silva",
      email: "silva@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
    },
  });

  // -----------------------------
  // Create labs
  // -----------------------------
  const chemistryLab = await prisma.lab.create({
    data: { name: "Chemistry Lab", gradeFrom: 12, gradeTo: 13 },
  });

  const biologyLab = await prisma.lab.create({
    data: { name: "Biology Lab", gradeFrom: 12, gradeTo: 13 },
  });

  const physicsLab = await prisma.lab.create({
    data: { name: "Physics Lab", gradeFrom: 12, gradeTo: 13 },
  });

  const scienceLab = await prisma.lab.create({
    data: { name: "Science Lab", gradeFrom: 6, gradeTo: 11 },
  });

  // -----------------------------
  // Teacher timetables (examples)
  // -----------------------------
  await prisma.teacherTimetable.createMany({
    data: [
      {
        teacherId: teacher1.id,
        day: DayOfWeek.MONDAY,
        period: 3,
        subject: "Science",
        grade: 10,
        classCode: "10A",
        available: true,
      },
      {
        teacherId: teacher2.id,
        day: DayOfWeek.TUESDAY,
        period: 2,
        subject: "Physics",
        grade: 12,
        classCode: "12B",
        available: true,
      },
      {
        teacherId: teacher3.id,
        day: DayOfWeek.WEDNESDAY,
        period: 4,
        subject: "Chemistry",
        grade: 12,
        classCode: "12C",
        available: true,
      },
    ],
  });

  // -----------------------------
  // Lab timetables (examples)
  // -----------------------------
  await prisma.labTimetable.createMany({
    data: [
      {
        labId: scienceLab.id,
        day: DayOfWeek.MONDAY,
        period: 3,
        available: true,
        classCode: "10A",
      },
      {
        labId: physicsLab.id,
        day: DayOfWeek.TUESDAY,
        period: 2,
        available: true,
        classCode: "12B",
      },
      {
        labId: chemistryLab.id,
        day: DayOfWeek.WEDNESDAY,
        period: 4,
        available: true,
        classCode: "12C",
      },
      {
        labId: biologyLab.id,
        day: DayOfWeek.THURSDAY,
        period: 1,
        available: true,
        classCode: "13A",
      },
    ],
  });

  console.log("✅ Seeding completed successfully");
  console.log("👤 Deputy Principal login:", deputyPrincipal.email, "/", "deputy123");
  console.log("👩‍🏫 Teacher 1 login:", teacher1.email, "/", "teacher123");
  console.log("👨‍🏫 Teacher 2 login:", teacher2.email, "/", "teacher123");
  console.log("👩‍🏫 Teacher 3 login:", teacher3.email, "/", "teacher123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
