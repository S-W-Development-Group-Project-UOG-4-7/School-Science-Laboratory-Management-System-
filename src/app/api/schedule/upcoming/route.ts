import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1); // tomorrow 00:00

    const schedules = await prisma.labSchedule.findMany({
      where: {
        date: { gte: start },
      },
      include: {
        lab: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { period: "asc" }],
      take: 50, // optional safety
    });

    return NextResponse.json({ ok: true, schedules });
  } catch (err: any) {
    console.error("GET /api/schedule/upcoming error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
