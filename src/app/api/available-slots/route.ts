import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Slot = { period: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { teacherId, labId, day } = body

    // 1. Validate request body
    if (!teacherId || !labId || !day) {
      return NextResponse.json(
        { error: 'Missing required fields: teacherId, labId, or day' },
        { status: 400 }
      )
    }

    // 2. Get teacher availability
    const teacherSlots = await prisma.teacherTimetable.findMany({
      where: {
        teacherId,
        day,
        available: true,
      },
      select: {
        period: true,
      },
    })

    // 3. Get lab availability
    const labSlots = await prisma.labTimetable.findMany({
      where: {
        labId,
        day,
        available: true,
      },
      select: {
        period: true,
      },
    })

    // 4. Get already booked practicals
    const bookedPracticals = await prisma.practical.findMany({
      where: {
        labId,
        day,
      },
      select: {
        period: true,
      },
    })

    // 5. Convert to Sets for faster lookup
    const teacherSet = new Set(teacherSlots.map((s: Slot) => s.period))
    const labSet = new Set(labSlots.map((s: Slot) => s.period))
    const bookedSet = new Set(bookedPracticals.map((p: Slot) => p.period))

    // 6. Find available periods (common between teacher and lab, excluding booked)
    const availablePeriods = [...teacherSet].filter(
      (period) => labSet.has(period) && !bookedSet.has(period)
    )

    // 7. Return response
    return NextResponse.json({
      day,
      availablePeriods,
    })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
