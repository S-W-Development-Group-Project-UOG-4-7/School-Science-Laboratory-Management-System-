// lib/db/quiz.ts
import { prisma } from "@/lib/prisma";
import type { QuestionType, QuizStatus } from "@prisma/client";

export interface CreateQuizInput {
  title: string;
  description?: string;
  practicalId: number;
  teacherId: number;
  totalMarks?: number;
  passingMarks?: number;
  timeLimit?: number;
  status?: QuizStatus;
  questions: Array<{
    question: string;
    type: QuestionType;
    options: string[];
    correctAnswer?: string;
    correctAnswers?: any;
    marks?: number;
    explanation?: string;
  }>;
}

// 1. Create quiz with questions
export async function createQuiz(data: CreateQuizInput) {
  return await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      practicalId: data.practicalId,
      teacherId: data.teacherId,
      totalMarks: data.totalMarks || 100,
      passingMarks: data.passingMarks || 60,
      timeLimit: data.timeLimit,
      status: data.status || 'DRAFT',
      questions: {
        create: data.questions.map((q, index) => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          correctAnswers: q.correctAnswers,
          marks: q.marks || 1,
          explanation: q.explanation,
          order: index,
        })),
      },
    },
    include: {
      questions: true,
    },
  });
}

// 2. Get quizzes by practical
export async function getQuizzesByPractical(practicalId: number) {
  return await prisma.quiz.findMany({
    where: { practicalId },
    include: {
      questions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}