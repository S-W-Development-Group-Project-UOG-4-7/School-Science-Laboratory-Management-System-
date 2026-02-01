import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ScheduleStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/src/lib/auth";

const prisma = new PrismaClient();

// ✅ helper: session in App Router must include req
async function getSessionFromReq(req: NextRequest) {
  return getServerSession({ req, ...authOptions } as any);
}

export async function POST(req: NextRequest) {
  console.log("📨 POST /api/schedules - Start");

  try {
    const session = (await getSessionFromReq(req)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const role = String((session.user as any).role || "").toLowerCase();
    if (role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Only teachers can schedule practicals" },
        { status: 403 }
      );
    }

    const teacherId = Number((session.user as any).teacherId || 0);
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const requiredFields = ["title", "date", "period", "grade", "className", "subject"];
    const missing = requiredFields.filter((f) => !body?.[f]);
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const scheduleDate = new Date(body.date);
    if (Number.isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    const existing = await prisma.practicalSchedule.findFirst({
      where: {
        teacherId,
        date: scheduleDate,
        period: body.period,
        status: ScheduleStatus.UPCOMING,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `You already have a scheduled practical at period ${body.period} on ${body.date}`,
        },
        { status: 409 }
      );
    }

    const schedule = await prisma.practicalSchedule.create({
      data: {
        title: body.title,
        date: scheduleDate,
        period: body.period,
        grade: body.grade,
        className: body.className,
        fullClassName: body.fullClassName || `${body.grade} - ${body.className}`,
        subject: body.subject,
        teacherId,
        location: body.location || "Primary Lab",
        notes: body.notes || "",
        status: ScheduleStatus.UPCOMING,
      },
      include: {
        teacher: { include: { user: true } },
        attachments: true,
      },
    });

    return NextResponse.json(
      { success: true, schedule, message: "Practical scheduled successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Error in POST /api/schedules:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  console.log("📅 GET /api/schedules - Start");

  try {
    const session = (await getSessionFromReq(req)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Not authenticated", schedules: [] },
        { status: 401 }
      );
    }

    const role = String((session.user as any).role || "").toLowerCase();
    const teacherId = Number((session.user as any).teacherId || 0);
    const labAssistantId = Number((session.user as any).labAssistantId || 0);

    const { searchParams } = new URL(req.url);
    const teacherIdParam = searchParams.get("teacherId");

    const where: any = {};

    if (role === "teacher") {
      if (!teacherId) {
        return NextResponse.json({ success: true, schedules: [], count: 0 });
      }
      where.teacherId = teacherId;
    } else if (role === "lab_assistant") {
      if (!labAssistantId) {
        return NextResponse.json({ success: true, schedules: [], count: 0 });
      }
      where.equipmentRequests = { some: { labAssistantId } };
    } else if (role === "admin") {
      if (teacherIdParam) where.teacherId = Number(teacherIdParam);
    } else {
      return NextResponse.json({ success: true, schedules: [], count: 0 });
    }

    const schedules = await prisma.practicalSchedule.findMany({
      where,
      include: {
        teacher: { include: { user: true } },
        attachments: true,
        equipmentRequests: {
          include: {
            equipmentItems: true,
            labAssistant: { include: { user: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      success: true,
      schedules: schedules || [],
      count: schedules?.length || 0,
    });
  } catch (err: any) {
    console.error("❌ Error in GET /api/schedules:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch schedules", schedules: [] },
      { status: 500 }
    );
  }
}