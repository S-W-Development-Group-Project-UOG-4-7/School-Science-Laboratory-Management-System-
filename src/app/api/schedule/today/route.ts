import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";

export async function GET() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const schedules = await prisma.labSchedule.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        lab: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { period: "asc" },
    });

    return NextResponse.json({ ok: true, schedules });
  } catch (err: any) {
    console.error("GET /api/schedule/today error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
