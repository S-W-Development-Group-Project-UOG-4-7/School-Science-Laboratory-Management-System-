import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count practicals
    const count = await prisma.practical.count();
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      database: 'Connected',
      practicalCount: count
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      database: 'Failed to connect'
    }, { status: 500 });
  }
}