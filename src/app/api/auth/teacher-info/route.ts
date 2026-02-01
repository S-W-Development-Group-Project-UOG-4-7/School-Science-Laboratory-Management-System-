import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const role = (session.user as any).role;
    if (role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Not a teacher" },
        { status: 401 }
      );
    }

    const teacherId = Number((session.user as any).teacherId || 0);

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      teacherId,
      userId: Number(session.user.id),
    });
  } catch (err) {
    console.error("teacher-info error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}