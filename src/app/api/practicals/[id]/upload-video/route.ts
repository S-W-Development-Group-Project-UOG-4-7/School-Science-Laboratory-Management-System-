// File: src/app/api/practicals/[id]/upload-video/route.ts
// Simplified route for saving video URLs to database

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ==========================================
// SAVE VIDEO URL TO DATABASE
// ==========================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: practicalId } = await params;
    
    const body = await request.json();
    const { videoUrl } = body;
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'No video URL provided' },
        { status: 400 }
      );
    }

    // Check if practical exists
    const p = prisma as any;
    const practicalExists = await p.practical?.findUnique({
      where: { id: practicalId },
    });

    if (!practicalExists) {
      return NextResponse.json(
        { error: 'Practical not found' },
        { status: 404 }
      );
    }

    // Validate URL is YouTube or Vimeo
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isVimeo = videoUrl.includes('vimeo.com');
    
    if (!isYouTube && !isVimeo) {
      return NextResponse.json(
        { error: 'Only YouTube and Vimeo URLs are supported' },
        { status: 400 }
      );
    }

    // Convert to embed URL
    let embedUrl = videoUrl;
    let videoId: string | null = null;
    
    if (isYouTube) {
      videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL. Could not extract video ID.' },
          { status: 400 }
        );
      }
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (isVimeo) {
      videoId = extractVimeoId(videoUrl);
      if (!videoId) {
        return NextResponse.json(
          { error: 'Invalid Vimeo URL. Could not extract video ID.' },
          { status: 400 }
        );
      }
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }


    const uploadedById = practicalExists?.createdById;

    // Save to database
    const video = await p.video?.upsert({
      where: { practicalId },
      update: {
        videoUrl: embedUrl,
        videoType: 'EMBEDDED',
        cloudProvider: isYouTube ? 'youtube' : 'vimeo',
        updatedAt: new Date(),
      },
      create: {
        practicalId,
        videoUrl: embedUrl,
        videoType: 'EMBEDDED',
        cloudProvider: isYouTube ? 'youtube' : 'vimeo',
        uploadedById,
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl: embedUrl,
      video,
      videoId,
    });
  } catch (error) {
    console.error('URL save error:', error);
    return NextResponse.json(
      { error: 'Failed to save video URL' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractYouTubeId(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}