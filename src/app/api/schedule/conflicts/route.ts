import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";

export async function GET() {
  try {
    const [labConflicts, teacherConflicts] = await Promise.all([
      prisma.labSchedule.groupBy({
        by: ["labId", "date", "period"],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
      prisma.labSchedule.groupBy({
        by: ["teacherId", "date", "period"],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
    ]);

    return NextResponse.json({ ok: true, labConflicts, teacherConflicts });
  } catch (err: any) {
    console.error("GET /api/schedule/conflicts error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
