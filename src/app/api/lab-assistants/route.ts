import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all users with LAB_ASSISTANT role
    const users = await prisma.user.findMany({
      where: { role: 'LAB_ASSISTANT' },
      select: { id: true, name: true, email: true },
    });

    // Upsert lab assistants safely
    for (const user of users) {
      await prisma.labAssistant.upsert({
        where: { userId: user.id },  // unique constraint field
        update: {},                  // do nothing if exists
        create: {
          userId: user.id,
          email: user.email,
        },
      });
    }

    // Fetch lab assistants with user details
    const labAssistants = await prisma.labAssistant.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ assistants: labAssistants });
  } catch (error) {
    console.error('Lab assistant fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab assistants' },
      { status: 500 }
    );
  }
}
