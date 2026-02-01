import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";
import { DayOfWeek } from "@prisma/client";

type Body = {
  teacherId: string;
  labId: string;
  day: DayOfWeek;
  date: string; // "2026-02-05"
};

// change if your school has different number of periods
const ALL_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { teacherId, labId, day, date } = body;

    if (!teacherId || !labId || !day || !date) {
      return NextResponse.json(
        { error: "teacherId, labId, day, date are required" },
        { status: 400 }
      );
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // 1) Teacher weekly available periods (optional)
    const teacherAvail = await prisma.teacherTimetable.findMany({
      where: { teacherId, day, available: true },
      select: { period: true },
    });

    // 2) Lab weekly available periods (optional)
    const labAvail = await prisma.labTimetable.findMany({
      where: { labId, day, available: true },
      select: { period: true },
    });

    // If timetables are empty (not configured), fallback to all periods
    const teacherPeriods = teacherAvail.length
      ? new Set(teacherAvail.map((x) => x.period))
      : new Set(ALL_PERIODS);

    const labPeriods = labAvail.length
      ? new Set(labAvail.map((x) => x.period))
      : new Set(ALL_PERIODS);

    // Candidate periods = intersection
    const candidate = ALL_PERIODS.filter((p) => teacherPeriods.has(p) && labPeriods.has(p));

    // 3) Get already-booked periods on that date for teacher/lab
    const booked = await prisma.labSchedule.findMany({
      where: {
        date: d,
        day,
        OR: [{ teacherId }, { labId }],
      },
      select: { period: true, teacherId: true, labId: true },
    });

    const bookedTeacher = new Set(booked.filter(b => b.teacherId === teacherId).map(b => b.period));
    const bookedLab = new Set(booked.filter(b => b.labId === labId).map(b => b.period));

    // 4) Free = candidate not booked by teacher or lab
    const freePeriods = candidate.filter((p) => !bookedTeacher.has(p) && !bookedLab.has(p));

    return NextResponse.json({
      day,
      date,
      teacherId,
      labId,
      freePeriods,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to compute available slots" }, { status: 500 });
  }
}
