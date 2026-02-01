import { PrismaClient, Role, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ✅ Clean tables (ORDER MATTERS due to relations)
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.labSchedule.deleteMany(),
    prisma.inventoryRequest.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.lab.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // -----------------------------
  // Create users
  // -----------------------------
  const deputyPrincipal = await prisma.user.create({
    data: {
      name: "Deputy Principal",
      email: "deputyprincipal@school.lk",
      password: "deputy123",
      role: Role.DEPUTY_PRINCIPAL,
      updatedAt: new Date(),
    },
  });

  const principal = await prisma.user.create({
    data: {
      name: "Principal",
      email: "principal@school.lk",
      password: "principal123",
      role: Role.PRINCIPAL,
      updatedAt: new Date(),
    },
  });

  
  const teacher1 = await prisma.user.create({
    data: {
      name: "Mrs Jayasuriya",
      email: "teacher@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
      updatedAt: new Date(),
    },
  });

  
  const teacher2 = await prisma.user.create({
    data: {
      name: "Mr Perera",
      email: "perera@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
      updatedAt: new Date(),
    },
  });

  
  const teacher3 = await prisma.user.create({
    data: {
      name: "Ms Silva",
      email: "silva@school.lk",
      password: "teacher123",
      role: Role.TEACHER,
      updatedAt: new Date(),
    },
  });

  // -----------------------------
  // Create labs
  // -----------------------------
  const chemistryLab = await prisma.lab.create({
    data: {
      name: "Chemistry Lab",
      location: "Block A",
      updatedAt: new Date(),
    },
  });

  const biologyLab = await prisma.lab.create({
    data: {
      name: "Biology Lab",
      location: "Block B",
      updatedAt: new Date(),
    },
  });

  const physicsLab = await prisma.lab.create({
    data: {
      name: "Physics Lab",
      location: "Block C",
      updatedAt: new Date(),
    },
  });

  const scienceLab = await prisma.lab.create({
    data: {
      name: "Science Lab",
      location: "Block D",
      updatedAt: new Date(),
    },
  });

  // -----------------------------
  // Create Lab Schedules (your timetable)
  // -----------------------------
  const date1 = new Date("2026-02-03"); // Tuesday
  const date2 = new Date("2026-02-04"); // Wednesday
  const date3 = new Date("2026-02-05"); // Thursday
  const date4 = new Date("2026-02-06"); // Friday

  await prisma.labSchedule.createMany({
    data: [
      {
        labId: scienceLab.id,
        teacherId: teacher1.id,
        day: DayOfWeek.MONDAY,
        period: 3,
        date: date1,
        title: "Grade 10 Practical",
        subject: "Science",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        labId: physicsLab.id,
        teacherId: teacher2.id,
        day: DayOfWeek.TUESDAY,
        period: 2,
        date: date2,
        title: "Grade 12 Practical",
        subject: "Physics",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        labId: chemistryLab.id,
        teacherId: teacher3.id,
        day: DayOfWeek.WEDNESDAY,
        period: 4,
        date: date3,
        title: "Grade 12 Practical",
        subject: "Chemistry",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        labId: biologyLab.id,
        teacherId: teacher1.id,
        day: DayOfWeek.THURSDAY,
        period: 1,
        date: date4,
        title: "Grade 13 Practical",
        subject: "Biology",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding completed successfully");
  console.log("👤 Principal login:", principal.email, "/", "principal123");
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
