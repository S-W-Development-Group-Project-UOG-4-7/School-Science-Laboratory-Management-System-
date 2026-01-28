import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

/**
 * PUT /api/practicals/:id
 * Update details (ONLY for UPCOMING typically)
 * You can allow admin/owner checks later.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const existing = await prisma.practical.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Optional: block editing completed/cancelled
    if (existing.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "Only UPCOMING sessions can be edited" },
        { status: 409 }
      );
    }

    // For simplicity: allow updating title, notes, maxStudents
    const updated = await prisma.practical.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        notes: body.notes ?? existing.notes,
        maxStudents:
          body.maxStudents !== undefined
            ? Number(body.maxStudents)
            : existing.maxStudents,
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update failed", details: e?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/practicals/:id
 * Better approach: "cancel" by setting status=CANCELLED (not hard delete)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const existing = await prisma.practical.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const cancelled = await prisma.practical.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Cancelled", cancelled });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Cancel failed", details: e?.message },
      { status: 500 }
    );
  }
}
