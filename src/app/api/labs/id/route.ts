import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// PUT /api/labs/:id  body: { "name": "New Name" }
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Lab name is required" }, { status: 400 });
    }

    const updated = await prisma.lab.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: "Update failed", details: e?.message }, { status: 400 });
  }
}

// DELETE /api/labs/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.lab.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Delete failed (lab may be used in timetable/practicals)", details: e?.message },
      { status: 400 }
    );
  }
}
