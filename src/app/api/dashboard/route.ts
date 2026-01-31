import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePrincipal } from '@/lib/auth'
import { RequestStatus } from '@prisma/client'

export async function GET(req: Request) {
  const role = req.headers.get('x-user-role') ?? undefined
  if (!requirePrincipal(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [pendingRequests, fulfilledRequests, lowStockItems] = await Promise.all([
    prisma.inventoryRequest.count({ where: { status: RequestStatus.pending } }),
    prisma.inventoryRequest.count({ where: { status: RequestStatus.fulfilled } }),
    prisma.inventoryItem.count({
      where: {
        stockLevel: { lte: prisma.inventoryItem.fields.minStockLevel },
      } as any,
    }),
  ])

  return NextResponse.json({
    pendingRequests,
    fulfilledRequests,
    lowStockItems,
  })
}
