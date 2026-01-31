import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePrincipal } from '@/lib/auth'
import { NotificationType, RequestStatus } from '@prisma/client'

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const role = req.headers.get('x-user-role') ?? undefined
  const principalId = req.headers.get('x-user-id') ?? undefined // send from frontend later

  if (!requirePrincipal(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!principalId) {
    return NextResponse.json({ error: 'Missing principal id' }, { status: 400 })
  }

  const id = ctx.params.id

  const existing = await prisma.inventoryRequest.findUnique({
    where: { id },
    include: { item: true, requestedBy: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (existing.status !== RequestStatus.pending) {
    return NextResponse.json({ error: 'Only pending requests can be approved' }, { status: 400 })
  }

  const updated = await prisma.inventoryRequest.update({
    where: { id },
    data: {
      status: RequestStatus.approved,
      approvedById: principalId,
      approvedDate: new Date(),
    },
    include: { item: true, requestedBy: true },
  })

  // notify requester
  await prisma.notification.create({
    data: {
      userId: updated.requestedById,
      type: NotificationType.approval,
      title: 'Request Approved',
      message: `Your request for ${updated.quantity} ${updated.item.unit} of ${updated.item.name} was approved.`,
      requestId: updated.id,
      read: false,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: 'APPROVED',
      details: `Approved request for ${updated.item.name} (qty ${updated.quantity})`,
      userId: principalId,
    },
  })

  return NextResponse.json(updated)
}
