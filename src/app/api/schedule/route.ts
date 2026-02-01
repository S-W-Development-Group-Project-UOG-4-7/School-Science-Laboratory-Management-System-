import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get("userRole") || "";

    // Example: Principal sees all schedules
    // (Change this model name/fields to match your Prisma schema)
    const schedules = await prisma.labSchedule.findMany({
      orderBy: [{ day: "asc" }, { period: "asc" }],
    });

    return NextResponse.json({ ok: true, userRole, schedules });
  } catch (err: any) {
    console.error("GET /api/schedule error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
