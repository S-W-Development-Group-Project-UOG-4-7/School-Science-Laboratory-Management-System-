// src/app/api/schedules/[id]/attachments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Convert file to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Ensure uploads folder exists in public
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Save file locally
  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, buffer);

  // Save file metadata in FileUpload
  const attachment = await prisma.fileUpload.create({
    data: {
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/uploads/${file.name}`,
      url: `/uploads/${file.name}`,
      uploadedBy: 1, // replace with authenticated user ID
      entityType: 'schedule_attachment',
      entityId: Number(params.id),
    },
  });

  return NextResponse.json(attachment);
}
