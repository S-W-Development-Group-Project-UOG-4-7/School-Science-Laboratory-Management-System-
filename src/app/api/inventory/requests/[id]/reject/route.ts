import { NextResponse } from "next/server";
import { prisma } from '@/src/app/lib/prisma'

type Action = "approve" | "reject" | "hold";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const action: Action = body?.action;
    const note: string | undefined = body?.note;

    const userId = req.headers.get("x-user-id") || "";
    const userRole = (req.headers.get("x-user-role") || "").toUpperCase();

    // Only principal/admin should approve/reject/hold
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing x-user-id" }, { status: 401 });
    }
    if (userRole !== "PRINCIPAL" && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (!action || !["approve", "reject", "hold"].includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    // Build prisma update data
    const data: any = {};
    const now = new Date();

    if (action === "approve") {
      data.status = "approved";
      data.approvedById = userId;
      data.approvedDate = now;
      data.rejectedById = null;
      data.rejectedDate = null;
      if (note !== undefined) data.notes = note;
    }

    if (action === "reject") {
      data.status = "rejected";
      data.rejectedById = userId;
      data.rejectedDate = now;
      data.approvedById = null;
      data.approvedDate = null;
      if (note !== undefined) data.notes = note;
    }

    if (action === "hold") {
      // UI shows "on-hold", DB stores "in_progress"
      data.status = "in_progress";
      if (note !== undefined) data.notes = note;
    }

    const updated = await prisma.inventoryRequest.update({
      where: { id: params.id },
      data,
      include: {
        item: true,
        requestedBy: { select: { id: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
