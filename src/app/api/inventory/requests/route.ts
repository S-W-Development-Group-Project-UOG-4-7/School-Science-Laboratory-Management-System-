import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePrincipal } from '@/lib/auth'

export async function GET(req: Request) {
  const role = req.headers.get('x-user-role') ?? undefined
  if (!requirePrincipal(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') // pending | approved | rejected | fulfilled | in_progress

  const requests = await prisma.inventoryRequest.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      item: true,
      requestedBy: { select: { id: true, name: true, email: true, role: true } },
      approvedBy: { select: { id: true, name: true } },
      rejectedBy: { select: { id: true, name: true } },
      fulfilledBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(requests)
}
