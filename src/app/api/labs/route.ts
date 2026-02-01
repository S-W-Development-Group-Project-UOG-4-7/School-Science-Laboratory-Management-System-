import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";

// ✅ GET /api/labs  -> list labs
export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(labs);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to load labs", details: e?.message },
      { status: 500 }
    );
  }
}

// ✅ POST /api/labs -> create lab
// body: { "name": "Physics Lab", "gradeFrom": 6, "gradeTo": 13 }
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const gradeFrom = Number(body?.gradeFrom);
    const gradeTo = Number(body?.gradeTo);

    if (!name) {
      return NextResponse.json({ error: "Lab name is required" }, { status: 400 });
    }

    if (!Number.isInteger(gradeFrom) || !Number.isInteger(gradeTo)) {
      return NextResponse.json(
        { error: "gradeFrom and gradeTo must be integers" },
        { status: 400 }
      );
    }

    if (gradeFrom <= 0 || gradeTo <= 0 || gradeFrom > gradeTo) {
      return NextResponse.json(
        { error: "Invalid grade range (gradeFrom must be <= gradeTo and both > 0)" },
        { status: 400 }
      );
    }

    const lab = await prisma.lab.create({
      data: { name, gradeFrom, gradeTo },
    });

    return NextResponse.json(lab, { status: 201 });
  } catch (e: any) {
   
    return NextResponse.json(
      { error: "Lab already exists or invalid data", details: e?.message },
      { status: 400 }
    );
  }
}
