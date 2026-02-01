import { NextResponse } from "next/server";
import { prisma } from '@/src/app/lib/prisma'
import { Role } from "@prisma/client";

// GET /api/teachers -> list teachers
export async function GET() {
  const teachers = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(teachers);
}

// POST /api/teachers -> create teacher user
// body: { "name":"...", "email":"...", "password":"..." }
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, password are required" }, { status: 400 });
    }

    // NOTE: for production, hash password (we'll do later)
    const teacher = await prisma.user.create({
      data: { name, email, password, role: Role.TEACHER },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Teacher create failed (email may already exist)", details: e?.message },
      { status: 400 }
    );
  }
}
