import { NextResponse } from "next/server";
import { prisma } from '@/src/app/lib/prisma'

// PUT /api/teachers/:id  body: { name?, email?, password? }
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const data: any = {};
    if (body?.name) data.name = String(body.name).trim();
    if (body?.email) data.email = String(body.email).trim().toLowerCase();
    if (body?.password) data.password = String(body.password).trim(); // later hash

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: "Update failed", details: e?.message }, { status: 400 });
  }
}

// DELETE /api/teachers/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    // If this teacher has timetable/practicals, delete may fail due to relations.
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Delete failed (teacher may have timetable/practicals)", details: e?.message },
      { status: 400 }
    );
  }
}
