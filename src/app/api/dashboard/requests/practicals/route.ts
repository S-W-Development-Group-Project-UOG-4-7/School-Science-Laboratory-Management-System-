import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')
    
    const practicals = await prisma.practical.findMany({
      where: {
        ...(subject && { subject }),
        ...(grade && { grade: parseInt(grade) })
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      practicals: practicals.map(practical => ({
        id: practical.id,
        title: practical.title,
        description: practical.description,
        subject: practical.subject,
        grade: practical.grade,
        duration: practical.duration,
        difficulty: practical.difficulty,
        videoUrl: practical.videoUrl,
        labSheetUrl: practical.labSheetUrl
      }))
    })
    
  } catch (error) {
    console.error('Practicals API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch practicals' },
      { status: 500 }
    )
  }
}

// POST to add new practical
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const practical = await prisma.practical.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        grade: body.grade,
        duration: body.duration,
        difficulty: body.difficulty,
        videoUrl: body.videoUrl,
        labSheetUrl: body.labSheetUrl
      }
    })

    return NextResponse.json({
      success: true,
      practical
    })
    
  } catch (error) {
    console.error('Create practical error:', error)
    return NextResponse.json(
      { error: 'Failed to create practical' },
      { status: 500 }
    )
  }
}