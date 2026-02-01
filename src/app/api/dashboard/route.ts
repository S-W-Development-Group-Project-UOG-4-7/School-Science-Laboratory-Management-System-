import { NextResponse } from "next/server";
import { prisma } from "@/src/app/lib/prisma";
import { requireDeputyPrincipal } from "@/src/app/lib/auth";

export async function GET(req: Request) {
  try {
    // Read role from header (make sure frontend sends it)
    const role = req.headers.get("x-user-role") ?? undefined;

    // Allow Principal + Deputy Principal (based on your requirePrincipal helper)
    if (!requireDeputyPrincipal(role)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid role or missing x-user-role header" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Map JS day index -> enum-like strings
    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ] as const;

    const todayName = dayNames[now.getDay()];

    // NOTE:
    // Using count() without createdAt/updatedAt to avoid schema mismatch errors
    const [teacherTimetablesUpdated, labTimetablesUpdated, availableSlotsFound] =
      await Promise.all([
        prisma.teacherTimetable.count(),
        prisma.labTimetable.count(),
        prisma.labTimetable.count({
          where: {
            day: todayName as any, // if your DayOfWeek enum matches these values
            available: true,
          },
        }),
      ]);

    // Deputy dashboard card "Scheduled Sessions"
    // If you later add LabSchedule support back, replace 0 with a real count
    const scheduledSessions = 0;

    // Temporary static activity (until you implement ActivityLog)
    const recentActivity = [
      { message: "Teacher timetable updated", createdAt: new Date().toISOString() },
      { message: "Lab timetable updated", createdAt: new Date().toISOString() },
      { message: "Scheduling conflict checked", createdAt: new Date().toISOString() },
    ];

    return NextResponse.json({
      scheduledSessions,
      teacherTimetablesUpdated,
      labTimetablesUpdated,
      availableSlotsFound,
      recentActivity,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard error:", err);

    // Always return JSON
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
