import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Get user with teacher relationship
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      include: {
        teacher: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacherId: user.teacher?.id || null
    });
    
  } catch (error: any) {
    console.error('Teacher info error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}