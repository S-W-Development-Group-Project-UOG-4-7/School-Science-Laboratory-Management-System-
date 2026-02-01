import { NextResponse } from "next/server";
import { prisma } from '@/src/app/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const notifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    notifs.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type:
        n.type === "approval" ? "success" :
        n.type === "rejection" ? "error" :
        n.type === "fulfillment" ? "success" :
        "info",
      timestamp: n.createdAt.toISOString(),
      read: n.read,
      requestId: n.requestId ?? undefined,
      senderName: "System",
      senderRole: "System",
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, title, message, type, requestId } = body;

  const created = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type, // must match NotificationType in prisma
      requestId: requestId ?? null,
    },
  });

  return NextResponse.json(created);
}
