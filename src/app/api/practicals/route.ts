import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

/**
 * GET /api/practicals
 * Optional query params:
 *  - date=2026-02-01
 *  - teacherId=...
 *  - labId=...
 *  - status=UPCOMING|COMPLETED|CANCELLED
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date"); // yyyy-mm-dd
  const teacherId = searchParams.get("teacherId");
  const labId = searchParams.get("labId");
  const status = searchParams.get("status");

  const where: any = {};
  if (teacherId) where.teacherId = teacherId;
  if (labId) where.labId = labId;
  if (status) where.status = status;

  // date filter: match that calendar day (00:00 -> 23:59)
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    where.date = { gte: start, lte: end };
  }

  const practicals = await prisma.practical.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true, role: true } },
      lab: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "asc" }, { period: "asc" }],
  });

  return NextResponse.json(practicals);
}

/**
 * POST /api/practicals
 * Body:
 * {
 *   "title": "...",
 *   "date": "2026-02-01",          // yyyy-mm-dd
 *   "day": "MONDAY",
 *   "period": 3,
 *   "grade": 9,
 *   "subject": "Science",
 *   "teacherId": "...",
 *   "labId": "...",
 *   "maxStudents": 30,
 *   "notes": "..."
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      date,
      day,
      period,
      grade,
      subject,
      teacherId,
      labId,
      maxStudents,
      notes,
    } = body;

    // Basic validation
    if (
      !title ||
      !date ||
      !day ||
      !period ||
      !grade ||
      !subject ||
      !teacherId ||
      !labId ||
      !maxStudents
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert date string to DateTime
    // (store as UTC midnight for simplicity)
    const practicalDate = new Date(`${date}T00:00:00.000Z`);

    // 1) Check teacher is available in that slot
    const teacherSlot = await prisma.teacherTimetable.findFirst({
      where: { teacherId, day, period, available: true },
    });
    if (!teacherSlot) {
      return NextResponse.json(
        { error: "Teacher is not available in this slot" },
        { status: 409 }
      );
    }

    // 2) Check lab is available in that slot
    const labSlot = await prisma.labTimetable.findFirst({
      where: { labId, day, period, available: true },
    });
    if (!labSlot) {
      return NextResponse.json(
        { error: "Lab is not available in this slot" },
        { status: 409 }
      );
    }

    // 3) Check lab already booked at that date/day/period
    const existingLabBooking = await prisma.practical.findFirst({
      where: {
        labId,
        day,
        period,
        date: practicalDate,
        status: { not: "CANCELLED" },
      },
    });
    if (existingLabBooking) {
      return NextResponse.json(
        { error: "Lab is already booked for this slot" },
        { status: 409 }
      );
    }

    // 4) Check teacher already booked at that date/day/period
    const existingTeacherBooking = await prisma.practical.findFirst({
      where: {
        teacherId,
        day,
        period,
        date: practicalDate,
        status: { not: "CANCELLED" },
      },
    });
    if (existingTeacherBooking) {
      return NextResponse.json(
        { error: "Teacher already has a session in this slot" },
        { status: 409 }
      );
    }

    // Create practical
    const created = await prisma.practical.create({
      data: {
        title,
        date: practicalDate,
        day,
        period: Number(period),
        grade: Number(grade),
        subject,
        maxStudents: Number(maxStudents),
        notes: notes || null,
        teacherId,
        labId,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true, role: true } },
        lab: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to schedule practical", details: e?.message },
      { status: 500 }
    );
  }
}
