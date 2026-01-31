import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date()

  const schedules = await prisma.labSchedule.findMany({
    where: {
      date: {
        gt: today,
      },
    },
    include: {
      lab: { select: { name: true } },
      teacher: { select: { name: true } },
    },
    orderBy: [
      { date: 'asc' },
      { period: 'asc' },
    ],
  })

  return NextResponse.json(schedules)
}
