import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const attachmentId = Number(params.attachmentId);

    const attachment = await prisma.fileUpload.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // delete file from disk
    if (attachment.path && fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // delete from DB
    await prisma.fileUpload.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ message: 'Attachment deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
