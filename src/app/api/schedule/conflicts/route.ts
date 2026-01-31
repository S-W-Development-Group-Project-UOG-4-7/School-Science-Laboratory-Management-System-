import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const conflicts = await prisma.labSchedule.groupBy({
    by: ['labId', 'date', 'period'],
    _count: { id: true },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  })

  return NextResponse.json(conflicts)
}
