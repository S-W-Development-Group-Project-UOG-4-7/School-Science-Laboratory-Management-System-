// lib/db/practical.ts - CORRECTED VERSION
import { prisma } from "@/lib/prisma";
import type { DifficultyLevel } from "@prisma/client";

export interface CreatePracticalInput {
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: string;
  difficulty: DifficultyLevel;
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
  teacherId: number;
}

export interface UpdatePracticalInput {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  duration?: string;
  difficulty?: DifficultyLevel;
  videoUrl?: string;
  labSheetUrl?: string;
  thumbnail?: string;
}

// 1. Create a new practical
export async function createPractical(data: CreatePracticalInput) {
  return await prisma.practical.create({
    data: {
      title: data.title,
      description: data.description,
      subject: data.subject,
      grade: data.grade,
      duration: data.duration,
      difficulty: data.difficulty,
      videoUrl: data.videoUrl,
      labSheetUrl: data.labSheetUrl,
      thumbnail: data.thumbnail,
      teacherId: data.teacherId,
    }
  });
}

// 2. Get all practicals (with filters)
export async function getAllPracticals(filters?: {
  subject?: string;
  grade?: string;
  teacherId?: number;
  search?: string;
}) {
  const where: any = {};
  
  if (filters?.subject && filters.subject !== 'all') {
    where.subject = filters.subject;
  }
  
  if (filters?.grade && filters.grade !== 'all') {
    where.grade = filters.grade;
  }
  
  if (filters?.teacherId) {
    where.teacherId = filters.teacherId;
  }
  
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  return await prisma.practical.findMany({
    where,
    include: {
      teacher: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      },
      quizzes: {
        include: {
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// 3. Get practical by ID
export async function getPracticalById(id: number) {
  return await prisma.practical.findUnique({
    where: { id },
    include: {
      teacher: {
        include: {
          user: true,
        }
      },
      quizzes: {
        include: {
          questions: true,
        },
      },
    },
  });
}

// 4. Get practicals by teacher
export async function getPracticalsByTeacher(teacherId: number) {
  return await prisma.practical.findMany({
    where: { teacherId },
    include: {
      quizzes: {
        include: {
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// 5. Update practical
export async function updatePractical(id: number, data: UpdatePracticalInput) {
  return await prisma.practical.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

// 6. Delete practical
export async function deletePractical(id: number) {
  return await prisma.practical.delete({
    where: { id },
  });
}