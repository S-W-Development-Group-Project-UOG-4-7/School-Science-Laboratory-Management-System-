import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";
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
  try {
    const body = (await req.json()) as Body;
    const { labId, grid } = body;

    if (!labId || !grid) {
      return NextResponse.json({ error: "labId and grid are required" }, { status: 400 });
    }

    // Get lab info (name + optional db range)
    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      select: { name: true, gradeFrom: true, gradeTo: true },
    });

    if (!lab) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }

    const labName = (lab.name ?? "").toLowerCase();

    const isScience = labName.includes("science");
    const isBioPhyChem =
      labName.includes("biology") || labName.includes("physics") || labName.includes("chemistry");

    // ✅ Your required rules (priority)
    let minGrade: number;
    let maxGrade: number;
    let ruleMsg: string;

    if (isScience) {
      minGrade = 6;
      maxGrade = 11;
      ruleMsg = "Science Lab allows grades 6 to 11 only.";
    } else if (isBioPhyChem) {
      minGrade = 12;
      maxGrade = 13;
      ruleMsg = "Biology/Physics/Chemistry labs allow grades 12 to 13 only.";
    } else {
      // fallback: use DB range if lab type is unknown
      minGrade = lab.gradeFrom ?? 1;
      maxGrade = lab.gradeTo ?? 13;
      ruleMsg = `This lab allows grades ${minGrade} to ${maxGrade} only.`;
    }

    const invalidCells: string[] = [];
    const entries = Object.entries(grid);

    // Build timetable rows; collect invalid inputs instead of silently skipping
    const data = entries
      .map(([key, value]) => {
        const [dayStr, periodStr] = key.split("-");
        
        const period = Number(periodStr);

        if (!dayStr || !Number.isFinite(period) || period <= 0) return null;

        const day = dayStr as DayOfWeek;

        const v = (value ?? "").trim();
        if (!v) return null;

        const parsed = parseClassCode(v);
        if (!parsed) {
          invalidCells.push(`${key} (format must be like 12A)`);
          return null;
        }

        if (parsed.grade < minGrade || parsed.grade > maxGrade) {
          invalidCells.push(`${key} (${parsed.classCode})`);
          return null;
        }

        return {
          labId,
          day,
          period,
          available: true,
          classCode: parsed.classCode,
        };
      })
      .filter(Boolean) as any[];

    // ✅ If anything invalid, stop saving and send message for toast popup
    if (invalidCells.length > 0) {
      return NextResponse.json(
        {
          error: ruleMsg,
          invalidCells,
          allowedRange: { minGrade, maxGrade },
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.labTimetable.deleteMany({ where: { labId } });
      if (data.length) {
        await tx.labTimetable.createMany({ data });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save lab timetable" }, { status: 500 });
  }
}
