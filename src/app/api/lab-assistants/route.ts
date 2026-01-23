import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/lab-assistants
export async function GET(request: NextRequest) {
  try {
    const labAssistants = await prisma.labAssistant.findMany({
      include: {
        user: true
      }
    });

    // Add availability mock data (in production, this should come from the database)
    const assistantsWithAvailability = labAssistants.map(assistant => ({
      ...assistant,
      availability: ['Monday', 'Wednesday', 'Friday'] // Mock availability
    }));

    return NextResponse.json({ assistants: assistantsWithAvailability });
  } catch (error) {
    console.error('Error fetching lab assistants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab assistants' },
      { status: 500 }
    );
  }
}