import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Action = "approve" | "reject" | "hold";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const action = body?.action as Action | undefined;
    const note = typeof body?.note === "string" ? body.note : null;

    if (!action || !["approve", "reject", "hold"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    // ✅ Prisma enum values (must match schema.prisma exactly)
    const newStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
        ? "rejected"
        : "in_progress"; // ✅ hold -> in_progress

    const updated = await prisma.inventoryRequest.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        approvedDate: action === "approve" ? new Date() : undefined,
        rejectedDate: action === "reject" ? new Date() : undefined,
        // optional: store note into notes (schema has notes field)
        notes: note ?? undefined,
      },
      include: {
        item: true,
        requestedBy: true,
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
