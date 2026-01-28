import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET – Fetch all teacher timetable entries
 */
export async function GET() {
  const data = await prisma.teacherTimetable.findMany({
    include: {
      teacher: true,
    },
    orderBy: {
      period: 'asc',
    },
  })

  return NextResponse.json(data)
}

/**
 * POST – Create a timetable entry (Admin)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { teacherId, day, period, subject, grade } = body

    const entry = await prisma.teacherTimetable.create({
      data: {
        teacherId,
        day,
        period,
        subject,
        grade,
        available: true,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Time slot already exists or invalid data' },
      { status: 400 }
    )
  }
}
