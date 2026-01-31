// prisma/seed.ts
import { PrismaClient, Role, RequestPriority, RequestStatus, NotificationType, DayOfWeek } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (correct order)
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.labSchedule.deleteMany()
  await prisma.lab.deleteMany()
  await prisma.inventoryRequest.deleteMany()
  await prisma.inventoryItem.deleteMany()
 
  await prisma.user.deleteMany()

  // --------------------
  // USERS
  // --------------------
  const principal = await prisma.user.create({
    data: {
      name: 'Principal Silva',
      email: 'principal@school.lk',
      password: await hash('principal123', 10),
      role: Role.PRINCIPAL,
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@school.lk',
      password: await hash('admin123', 10),
      role: Role.ADMIN,
    },
  })

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Mr. Perera',
      email: 'teacher1@school.lk',
      password: await hash('teacher123', 10),
      role: Role.TEACHER,
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Mrs. Fernando',
      email: 'teacher2@school.lk',
      password: await hash('teacher123', 10),
      role: Role.TEACHER,
    },
  })

  const labAssistant = await prisma.user.create({
    data: {
      name: 'Lab Assistant Kumar',
      email: 'labassist1@school.lk',
      password: await hash('labassist123', 10),
      role: Role.LAB_ASSISTANT,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Student Amal',
      email: 'student1@school.lk',
      password: await hash('student123', 10),
      role: Role.STUDENT,
    },
  })

  // --------------------
  // LABS
  // --------------------
  const labA = await prisma.lab.create({ data: { name: 'Lab A', location: 'Science Block - Ground Floor' } })
  const labB = await prisma.lab.create({ data: { name: 'Lab B', location: 'Science Block - 1st Floor' } })

  // --------------------
  // INVENTORY ITEMS
  // --------------------
  const microscope = await prisma.inventoryItem.create({
    data: {
      name: 'Microscope',
      category: 'Equipment',
      stockLevel: 15,
      minStockLevel: 5,
      unit: 'units',
      location: 'Lab A',
    },
  })

  const beakerSet = await prisma.inventoryItem.create({
    data: {
      name: 'Beaker Set',
      category: 'Glassware',
      stockLevel: 50,
      minStockLevel: 20,
      unit: 'sets',
      location: 'Storage B',
    },
  })

  const safetyGoggles = await prisma.inventoryItem.create({
    data: {
      name: 'Safety Goggles',
      category: 'Safety',
      stockLevel: 40,
      minStockLevel: 30,
      unit: 'pieces',
      location: 'Lab C',
    },
  })

  // --------------------
  // INVENTORY REQUESTS (Principal approves/rejects)
  // --------------------
  const reqPending = await prisma.inventoryRequest.create({
    data: {
      itemId: microscope.id,
      quantity: 2,
      priority: RequestPriority.high,
      status: RequestStatus.pending,
      reason: 'Need microscopes for biology practical class',
      neededDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requestedById: teacher1.id,
    },
  })

  const reqApproved = await prisma.inventoryRequest.create({
    data: {
      itemId: beakerSet.id,
      quantity: 5,
      priority: RequestPriority.medium,
      status: RequestStatus.approved,
      reason: 'Chemistry demonstration equipment',
      neededDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      requestedById: teacher2.id,
      approvedById: principal.id,
      approvedDate: new Date(),
    },
  })

  const reqFulfilled = await prisma.inventoryRequest.create({
    data: {
      itemId: safetyGoggles.id,
      quantity: 15,
      priority: RequestPriority.low,
      status: RequestStatus.fulfilled,
      reason: 'New students joining lab sessions',
      neededDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      requestedById: labAssistant.id,
      approvedById: principal.id,
      approvedDate: new Date(),
      fulfilledById: labAssistant.id,
      fulfilledDate: new Date(),
      fulfilledQuantity: 15,
      notes: 'Purchased from supplier and stored in Lab C cabinet',
    },
  })

  // --------------------
  // NOTIFICATIONS
  // Principal wants to see fulfilled items for approved requests
  // --------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: principal.id,
        type: NotificationType.fulfillment,
        title: 'Safety Goggles Restocked',
        message: 'Lab Assistant Kumar fulfilled an approved request and added 15 Safety Goggles to inventory.',
        read: false,
        requestId: reqFulfilled.id,
      },
      {
        userId: principal.id,
        type: NotificationType.request,
        title: 'New Inventory Request',
        message: 'Mr. Perera requested 2 Microscopes',
        read: false,
        requestId: reqPending.id,
      },
      {
        userId: teacher2.id,
        type: NotificationType.approval,
        title: 'Request Approved',
        message: 'Your request for Beaker Set was approved by the Principal.',
        read: false,
        requestId: reqApproved.id,
      },
    ],
  })

  // --------------------
  // LAB SCHEDULE (Principal-only)
  // --------------------
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  await prisma.labSchedule.createMany({
    data: [
      {
        labId: labA.id,
        teacherId: teacher1.id,
        day: DayOfWeek.MONDAY,
        period: 2,
        date: tomorrow,
        title: 'Biology Practical',
        subject: 'Biology',
      },
      {
        labId: labB.id,
        teacherId: teacher2.id,
        day: DayOfWeek.TUESDAY,
        period: 4,
        date: tomorrow,
        title: 'Chemistry Practical',
        subject: 'Chemistry',
  
      },
    ],
  })

  // --------------------
  // ACTIVITY LOGS
  // --------------------
  await prisma.activityLog.createMany({
    data: [
      { action: 'LOGIN', details: 'Principal logged in', userId: principal.id },
      { action: 'REQUESTED', details: 'Teacher requested microscopes', userId: teacher1.id },
      { action: 'APPROVED', details: 'Principal approved Beaker Set request', userId: principal.id },
      { action: 'FULFILLED', details: 'Lab assistant restocked Safety Goggles', userId: labAssistant.id },
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

// To run the seed script, use the command: npx ts-node prisma/seed.ts
