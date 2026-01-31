import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const schedules = await prisma.labSchedule.findMany({
    where: {
      date: today,
    },
    include: {
      lab: { select: { name: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { period: 'asc' },
  })

  return NextResponse.json(schedules)
}
