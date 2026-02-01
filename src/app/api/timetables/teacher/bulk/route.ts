import { NextResponse } from "next/server";
import { prisma } from '@/src/app/lib/prisma'
import { DayOfWeek } from "@prisma/client";

type Body = {
  teacherId: string;
  // "MONDAY-1": "8A", "TUESDAY-3": "", etc.
  grid: Record<string, string>;
};

function parseClassCode(code: string) {
  const v = (code ?? "").trim().toUpperCase();
  const m = v.match(/^(\d{1,2})([A-Z])$/);
  if (!m) return null;
  const grade = Number(m[1]);
  const section = m[2];
  return { grade, section, classCode: `${grade}${section}` };
}

function isValidDay(day: any): day is DayOfWeek {
  return ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].includes(day);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { teacherId, grid } = body;

    if (!teacherId || !grid || typeof grid !== "object") {
      return NextResponse.json(
        { error: "teacherId and grid are required" },
        { status: 400 }
      );
    }

    const entries = Object.entries(grid);

    await prisma.$transaction(async (tx) => {
      // wipe & recreate = simplest stable bulk save
      await tx.teacherTimetable.deleteMany({ where: { teacherId } });

      const data = entries
        .map(([key, value]) => {
          const [dayStr, periodStr] = key.split("-");
          const day = dayStr as DayOfWeek;
          const period = Number(periodStr);

          if (!isValidDay(day)) return null;
          if (!Number.isInteger(period) || period < 1 || period > 8) return null;

          const v = (value ?? "").trim();
          if (!v) return null;

          const parsed = parseClassCode(v);
          if (!parsed) {
            // throw stops transaction and returns error to UI
            throw new Error(`Invalid class code at ${key}. Use format like 8A / 11D`);
          }

          return {
            teacherId,
            day,
            period,
            subject: "Science",          // keep subject clean
            grade: parsed.grade,         // ✅ auto grade from classCode
            classCode: parsed.classCode, // ✅ save classCode properly
            available: true,
          };
        })
        .filter(Boolean) as any[];

      if (data.length) {
        await tx.teacherTimetable.createMany({ data });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to save teacher timetable" },
      { status: 400 }
    );
  }
}
