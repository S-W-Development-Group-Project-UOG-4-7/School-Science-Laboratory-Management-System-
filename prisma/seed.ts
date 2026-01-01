// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.inventoryRequest.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.labSchedule.deleteMany()
  await prisma.practical.deleteMany()
  await prisma.user.deleteMany()

  // --------------------
  // USERS
  // --------------------
  const principal = await prisma.user.create({
    data: {
      name: 'Principal Silva',
      email: 'principal@school.lk',
      password: await hash('principal123', 10),
      phone: '+94 71 224 5670',
      role: 'PRINCIPAL',
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@school.lk',
      password: await hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Mr. Perera',
      email: 'teacher1@school.lk',
      password: await hash('teacher123', 10),
      role: 'TEACHER',
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Mrs. Fernando',
      email: 'teacher2@school.lk',
      password: await hash('teacher123', 10),
      role: 'TEACHER',
    },
  })

  const labAssistant = await prisma.user.create({
    data: {
      name: 'Lab Assistant Kumar',
      email: 'labassist1@school.lk',
      password: await hash('labassist123', 10),
      role: 'LAB_ASSISTANT',
    },
  })

  const student = await prisma.user.create({
    data: {
      name: 'Student Amal',
      email: 'student1@school.lk',
      password: await hash('student123', 10),
      role: 'STUDENT',
    },
  })

  // --------------------
  // INVENTORY ITEMS
  // --------------------
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Microscope', category: 'Equipment', quantity: 15, minQuantity: 5, location: 'Lab A', status: 'Available' },
      { name: 'Beaker Set', category: 'Glassware', quantity: 50, minQuantity: 20, location: 'Storage B', status: 'Available' },
      { name: 'Bunsen Burner', category: 'Equipment', quantity: 20, minQuantity: 10, location: 'Lab A', status: 'Available' },
      { name: 'Test Tubes', category: 'Glassware', quantity: 200, minQuantity: 100, location: 'Storage B', status: 'Available' },
      { name: 'Safety Goggles', category: 'Safety', quantity: 40, minQuantity: 30, location: 'Lab C', status: 'Available' },
    ],
  })

  // --------------------
  // INVENTORY REQUESTS
  // --------------------
  await prisma.inventoryRequest.createMany({
    data: [
      {
        itemName: 'Microscope',
        quantity: 2,
        priority: 'High',
        status: 'Pending',
        reason: 'For biology practical class',
        requestedBy: teacher1.id,
      },
      {
        itemName: 'Beaker Set',
        quantity: 5,
        priority: 'Medium',
        status: 'Approved',
        reason: 'Chemistry demonstration',
        response: 'Request approved. Items available in Lab A.',
        requestedBy: teacher2.id,
      },
      {
        itemName: 'Safety Goggles',
        quantity: 15,
        priority: 'Low',
        status: 'Pending',
        reason: 'New students joining lab sessions',
        requestedBy: labAssistant.id,
      },
    ],
  })

  // --------------------
  // LAB SCHEDULES
  // --------------------
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  await prisma.labSchedule.createMany({
    data: [
      {
        title: 'Biology Practical',
        subject: 'Biology',
        date: tomorrow,
        time: '10:00 AM - 12:00 PM',
        location: 'Lab A',
        status: 'Scheduled',
        teacherId: teacher1.id,
      },
    ],
  })

  // --------------------
  // PRACTICALS
  // --------------------
  await prisma.practical.createMany({
    data: [
      {
        title: 'Microscopic Examination',
        description: 'Examining plant cells under microscope',
        subject: 'Biology',
        grade: 'Grade 11',
        duration: 90,
        difficulty: 'Intermediate',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        labSheetUrl: 'https://example.com/labsheet1.pdf',
        createdBy: teacher1.id,
      },
      {
        title: 'Chemical Reactions',
        description: 'Observing acid-base reactions',
        subject: 'Chemistry',
        grade: 'Grade 10',
        duration: 120,
        difficulty: 'Beginner',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        labSheetUrl: 'https://example.com/labsheet2.pdf',
        createdBy: teacher2.id,
      },
    ],
  })

  // --------------------
  // ACTIVITY LOGS
  // --------------------
  await prisma.activityLog.createMany({
    data: [
      { action: 'LOGIN', details: 'Admin logged in', userId: admin.id },
      { action: 'CREATED', details: 'Biology practical scheduled', userId: teacher1.id },
      { action: 'REQUESTED', details: 'Inventory request submitted', userId: teacher1.id },
      { action: 'APPROVED', details: 'Inventory request approved', userId: admin.id },
      { action: 'UPDATED', details: 'Inventory updated', userId: labAssistant.id },
    ],
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

  
