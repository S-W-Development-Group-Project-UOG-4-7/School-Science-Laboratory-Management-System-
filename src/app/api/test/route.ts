import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count users to test database
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      message: 'API is working',
      database: 'Connected',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({
      message: 'API error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'Test POST successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test POST error:', error);
    return NextResponse.json({
      message: 'API error',
      error: error.message
    }, { status: 500 });
  }
}