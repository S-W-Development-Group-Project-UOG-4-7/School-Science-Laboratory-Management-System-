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
      role: Role.DEPUTY_PRINCIPAL, // ✅ use correct role (recommended)
      // if you still want admin access, use Role.ADMIN
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Science Teacher",
      email: "teacher@school.lk",
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
  // Teacher timetable (example)
  // -----------------------------
  await prisma.teacherTimetable.create({
    data: {
      teacherId: teacher.id,
      day: DayOfWeek.MONDAY,
      period: 3,
      subject: "Science",
      grade: 10,          // ✅ must match classCode
      classCode: "10A",    // ✅ required if in schema
      available: true,
    },
  });

  // -----------------------------
  // Lab timetable (example)
  // -----------------------------
  await prisma.labTimetable.create({
    data: {
      labId: scienceLab.id,
      day: DayOfWeek.MONDAY,
      period: 3,
      available: true,
      classCode: "10A",    // ✅ required if in schema
    },
  });

  await prisma.labTimetable.create({
    data: {
      labId: physicsLab.id,
      day: DayOfWeek.MONDAY,
      period: 4,
      available: true,
      classCode: "11D",
    },
  });

  console.log("✅ Seeding completed successfully");
  console.log("👤 Deputy Principal:", deputyPrincipal.email, "/", "deputy123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
