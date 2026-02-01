import { NextResponse } from 'next/server'
import { prisma } from '@/src/app/lib/prisma'

export async function GET() {
  const lowStockItems = await prisma.inventoryItem.findMany({
    where: {
      stockLevel: {
        lte: prisma.inventoryItem.fields.minStockLevel,
      },
    },
  })

  return NextResponse.json(lowStockItems)
}