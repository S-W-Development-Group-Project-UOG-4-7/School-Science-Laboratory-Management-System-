import { prisma } from '@/src/app/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
