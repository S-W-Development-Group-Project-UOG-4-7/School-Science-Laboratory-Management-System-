import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

// GET /api/labs  -> list labs
export async function GET() {
  const labs = await prisma.lab.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(labs);
}

// POST /api/labs -> create lab
// body: { "name": "Physics Lab" }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Lab name is required" }, { status: 400 });
    }

    const lab = await prisma.lab.create({ data: { name } });
    return NextResponse.json(lab, { status: 201 });
  } catch (e: any) {
    // unique constraint error -> lab already exists
    return NextResponse.json(
      { error: "Lab already exists or invalid data", details: e?.message },
      { status: 400 }
    );
  }
}
