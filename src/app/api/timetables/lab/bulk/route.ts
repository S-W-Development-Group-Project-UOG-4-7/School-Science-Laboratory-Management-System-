import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DayOfWeek } from "@prisma/client";

type Body = {
  labId: string;
  grid: Record<string, string>; // "MONDAY-1" -> "12A"
};

function parseClassCode(code: string) {
  const v = (code ?? "").trim().toUpperCase();
  const m = v.match(/^(\d{1,2})([A-Z])$/);
  if (!m) return null;
  return { grade: Number(m[1]), section: m[2], classCode: v };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const { labId, grid } = body;

  if (!labId || !grid) {
    return NextResponse.json({ error: "labId and grid are required" }, { status: 400 });
  }

  // get lab range from DB for validation
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    select: { gradeFrom: true, gradeTo: true, name: true },
  });

  if (!lab) {
    return NextResponse.json({ error: "Lab not found" }, { status: 404 });
  }

  // if you want science lab only 6-9:
  const isScienceLab = (lab.name ?? "").toLowerCase().includes("science lab");
  const minGrade = isScienceLab ? 6 : lab.gradeFrom;
  const maxGrade = isScienceLab ? 9 : lab.gradeTo;

  const entries = Object.entries(grid);

  await prisma.$transaction(async (tx) => {
    // Delete & recreate = makes UPDATE + DELETE automatic
    await tx.labTimetable.deleteMany({ where: { labId } });

    const data = entries
      .map(([key, value]) => {
        const [dayStr, periodStr] = key.split("-");
        const day = dayStr as DayOfWeek;
        const period = Number(periodStr);
        const v = (value ?? "").trim();
        if (!v) return null;

        const parsed = parseClassCode(v);
        if (!parsed) return null;

        // grade restriction
        if (parsed.grade < minGrade || parsed.grade > maxGrade) return null;

        return {
          labId,
          day,
          period,
          available: true,
          classCode: parsed.classCode, // ✅ IMPORTANT: keep 11D, 10A etc
        };
      })
      .filter(Boolean) as any[];

    if (data.length) {
      await tx.labTimetable.createMany({ data });
    }
  });

  return NextResponse.json({ ok: true });
}
