
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const inventories = await prisma.inventory.findMany({
            orderBy: {
                instrumentName: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            data: inventories,
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch inventory',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
