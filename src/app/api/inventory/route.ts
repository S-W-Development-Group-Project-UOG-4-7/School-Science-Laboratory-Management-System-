import { NextResponse } from 'next/server'
import { prisma } from '@/src/app/lib/prisma'

export async function GET() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(items)
}