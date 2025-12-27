// lib/db/teacher.ts
import { prisma } from "@/lib/prisma";

// 1. Get teacher by user ID
export async function getTeacherByUserId(userId: number) {
  return await prisma.teacher.findUnique({
    where: { userId },
    include: {
      user: true,
      practicals: {
        include: {
          quizzes: true,
        },
      },
    },
  });
}

// 2. Get teacher by ID
export async function getTeacherById(id: number) {
  return await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}