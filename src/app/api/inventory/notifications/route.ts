import { NextResponse } from 'next/server'
import { prisma } from '@/src/app/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const principalId = searchParams.get('principalId')

  const notifications = await prisma.notification.findMany({
    where: {
      userId: principalId ?? undefined,
      type: 'fulfillment',
    },
    include: {
      request: {
        include: {
          item: true,
          fulfilledBy: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notifications)
}
