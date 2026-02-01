import { NextResponse } from 'next/server'
import { prisma } from '@/src/app/lib/prisma'

/**
 * GET – Fetch all lab timetable entries
 */
export async function GET() {
  const data = await prisma.labTimetable.findMany({
    include: {
      lab: true,
    },
    orderBy: {
      period: 'asc',
    },
  })

  return NextResponse.json(data)
}

/**
 * POST – Create lab availability (Admin)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { labId, day, period } = body

    const entry = await prisma.labTimetable.create({
      data: {
        labId,
        day,
        period,
        available: true,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lab already booked for this slot' },
      { status: 400 }
    )
  }
}
