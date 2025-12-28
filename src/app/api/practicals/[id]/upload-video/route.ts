// File: src/app/api/practicals/[id]/upload-video/route.ts
// This handles video uploads (both local and Cloudinary)

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// ==========================================
// OPTION 1: LOCAL STORAGE (Free, Simple)
// ==========================================

export async function POST_LOCAL(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const practicalId = params.id;
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, AVI, and MOV are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-z0-9.-]/gi, '_');
    const fileName = `practical-${practicalId}-${timestamp}-${sanitizedName}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'videos');
    await mkdir(uploadsDir, { recursive: true });
    
    // Save file to public/videos/
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Create public URL
    const videoUrl = `/videos/${fileName}`;
    
    // Save to database
    const video = await prisma.video.upsert({
      where: { practicalId },
      update: {
        videoUrl,
        fileName,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        videoType: 'UPLOADED',
        cloudProvider: 'local',
        updatedAt: new Date(),
      },
      create: {
        practicalId,
        videoUrl,
        fileName,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        videoType: 'UPLOADED',
        cloudProvider: 'local',
        uploadedById: 'USER_ID_HERE', // Get from session
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl,
      video,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}


// ==========================================
// OPTION 2: CLOUDINARY (Recommended, Free Tier)
// ==========================================

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST_CLOUDINARY(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const practicalId = params.id;
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'practicals',
          public_id: `practical-${practicalId}-${Date.now()}`,
          // Optional: Add transformations
          eager: [
            { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    const result = uploadResult as any;

    // Save to database
    const video = await prisma.video.upsert({
      where: { practicalId },
      update: {
        videoUrl: result.secure_url,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        duration: result.duration,
        videoType: 'UPLOADED',
        cloudProvider: 'cloudinary',
        publicId: result.public_id,
        updatedAt: new Date(),
      },
      create: {
        practicalId,
        videoUrl: result.secure_url,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        duration: result.duration,
        videoType: 'UPLOADED',
        cloudProvider: 'cloudinary',
        publicId: result.public_id,
        uploadedById: 'USER_ID_HERE', // Get from session
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl: result.secure_url,
      video,
      cloudinary: {
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video to Cloudinary' },
      { status: 500 }
    );
  }
}


// ==========================================
// OPTION 3: YOUTUBE URL (No Upload, Just Save)
// ==========================================

export async function POST_URL(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const practicalId = params.id;
    const body = await request.json();
    const { videoUrl } = body;
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'No video URL provided' },
        { status: 400 }
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
    if (isYouTube) {
      const videoId = extractYouTubeId(videoUrl);
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (isVimeo) {
      const videoId = extractVimeoId(videoUrl);
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    // Save to database
    const video = await prisma.video.upsert({
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
        uploadedById: 'USER_ID_HERE', // Get from session
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl: embedUrl,
      video,
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
function extractYouTubeId(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : '';
}

function extractVimeoId(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}


// ==========================================
// MAIN ROUTE HANDLER (Choose your method)
// ==========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contentType = request.headers.get('content-type') || '';
  
  // If it's a URL submission (JSON)
  if (contentType.includes('application/json')) {
    return POST_URL(request, { params });
  }
  
  // If it's a file upload (FormData)
  // Change this to use your preferred storage method:
  // return POST_LOCAL(request, { params });      // For local storage
  return POST_CLOUDINARY(request, { params });   // For Cloudinary
}